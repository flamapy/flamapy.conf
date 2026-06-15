/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import CustomButton from "../components/CustomButton";
import Question from "../components/Question";
import Configuration from "../components/Configuration";
import { useNavigate } from "react-router-dom";
import Information from "../components/Information";
import sendPostRequest from "../requests/sendPostRequest";

function Wizzard({ selectedFile, applyURL = false, templateFile = null }) {
  const cancelURL = import.meta.env?.VITE_CANCEL_CONFIGURATION_URL;
  // Plantilla M2T: subida por el usuario (modo full) o preconfigurada por URL (modo embed)
  const templateURL = import.meta.env?.VITE_TEMPLATE_URL;
  const hasTemplate = !!templateFile || !!templateURL;
  // En modo applyURL la prioridad es aplicar la configuración, no generar artefacto
  const willGenerate = hasTemplate && !applyURL;

  const [worker, setWorker] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState([]);
  const [message, setMessage] = useState({
    type: "info",
    msg: `Preparando el configurador para ${selectedFile.name}`,
  });
  const [configuration, setConfiguration] = useState(null);
  const [isApplied, setIsApplied] = useState(false);

  const [configurationURL, setConfigurationURL] = useState(null);

  const navigate = useNavigate();

  function initializeWorker() {
    const flamapyWorker = new Worker(import.meta.env?.BASE_URL + "webworker.js");
    flamapyWorker.postMessage(import.meta.env?.BASE_URL.toString());
    flamapyWorker.onmessage = (event) => {
      if (event.data.status === "loaded") {
        setIsLoaded(true);
      } else {
        setMessage({
          type: "error",
          msg: `Se produjo un error al inicializar el configurador`,
        });
      }
    };
    setWorker(flamapyWorker);
    return flamapyWorker;
  }

  useEffect(() => {
    try {
      const flamapyWorker = initializeWorker();
      return () => {
        flamapyWorker.terminate();
      };
    } catch (error) {
      setMessage({
        type: "error",
        msg: error.toString(),
      });
    }
  }, []);

  useEffect(() => {
    if (selectedFile && isLoaded) {
      const reader = new FileReader();
      const fileName = selectedFile.name;
      const extensionIndexStart = fileName.indexOf(".") + 1;
      const fileExtension = fileName.substring(
        extensionIndexStart,
        fileName.length
      );
      reader.onload = (e) => {
        const fileContent = e.target.result;

        worker.postMessage({
          action: "importModel",
          data: { fileContent, fileExtension },
        });

        worker.onmessage = async (event) => {
          if (event.data.results !== undefined) {
            setIsImported(true);
          } else if (event.data.error) {
            if (event.data.error.includes("not_supported")) {
              setMessage({
                type: "error",
                msg: "Error al importar: la extensión del archivo no es compatible. Prueba con uno de los siguientes formatos: .gfm.json, .afm, .fide, .json, .xml o .uvl",
              });
            } else {
              setMessage({
                type: "error",
                msg: "Se produjo un error al importar el modelo. Asegúrate de que el modelo es válido e inténtalo de nuevo.",
              });
            }
            setIsImported(true);
          }
        };
      };
      reader.readAsText(selectedFile);
    }
  }, [isLoaded, worker, selectedFile]);

  useEffect(() => {
    if (isImported) {
      worker.postMessage({
        action: "startConfigurator",
        data: null,
      });

      worker.onmessage = async (event) => {
        if (event.data.results !== undefined) {
          setMessage(null);
          setCurrentQuestion(event.data.results);
        }
      };
    }
  }, [isImported]);

  async function answerQuestion() {
    if (isImported) {
      const answerPayload = {};

      selectedAnswer.forEach((ans) => {
        let optionId;
        let value;

        if (typeof ans === "object" && ans.type) {
          optionId = ans.id;
          if (ans.type.toLowerCase() !== "string") {
            value = Number(ans.value);
          } else {
            value = ans.value;
          }
        } else {
          optionId = ans;
          value = true;
        }

        const option = currentQuestion.possibleOptions.find(
          (o) => o.id === optionId
        );

        if (option) {
          answerPayload[option.name] = value;
        }
      });

      worker.postMessage({ action: "answerQuestion", data: answerPayload });

      worker.onmessage = async (event) => {
        if (event.data.results !== undefined) {
          const results = event.data.results;
          if (results.valid) {
            if (results.configuration) {
              setConfiguration(results.configuration);
              setCurrentQuestion(null);
            } else {
              setCurrentQuestion(event.data.results.nextQuestion);
              setMessage(null);
            }
          } else {
            setMessage({ type: "error", msg: results.contradiction.msg });
          }
          setSelectedAnswer([]);
        }
      };
    }
  }

  async function undoAnswer() {
    if (isImported) {
      worker.postMessage({ action: "undoAnswer" });

      worker.onmessage = async (event) => {
        const results = event.data.results;
        setCurrentQuestion(results);
        if (configuration) setConfiguration(null);
        setSelectedAnswer([]);
      };
    }
  }

  function updateConfigurationValue(name, value) {
    setConfiguration((prev) => ({ ...prev, [name]: value }));
  }

  function downloadConfiguration() {
    if (!configuration) {
      setMessage({
        type: "error",
        msg: "No hay ninguna configuración disponible para descargar.",
      });
      return;
    }

    const jsonData = JSON.stringify(configuration, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "configuration.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function applyConfiguration() {
    if (isApplied && configurationURL) {
      window.location.href = configurationURL;
      return;
    }
    sendPostRequest(applyURL, configuration).then((newObjectUrl) => {
      if (newObjectUrl) {
        console.log("New object URL:", newObjectUrl);
        setMessage({
          type: "success",
          msg: "La configuración se ha aplicado correctamente",
        });
        setIsApplied(true);
        setConfigurationURL(newObjectUrl);
      } else {
        setMessage({
          type: "error",
          msg: "Se produjo un error al aplicar la configuración. Por favor, inténtalo de nuevo o descarga la configuración final.",
        });
      }
    });
  }

  // Obtiene el contenido de la plantilla Jinja: primero la subida por el
  // usuario (modo full), si no la preconfigurada por URL (modo embed).
  async function getTemplateContent() {
    if (templateFile) {
      return await templateFile.text();
    }
    if (templateURL) {
      // URL absoluta: se usa tal cual. Ruta relativa: se resuelve sobre BASE_URL
      // para respetar el sub-path de despliegue (VITE_BASENAME).
      const resolvedURL = templateURL.startsWith("http")
        ? templateURL
        : import.meta.env?.BASE_URL + templateURL.replace(/^\//, "");
      const res = await fetch(resolvedURL);
      if (!res.ok) {
        throw new Error("No se pudo cargar la plantilla de transformación.");
      }
      return await res.text();
    }
    return null;
  }

  // Transformación Model-to-Text (M2T) genérica: aplica la plantilla Jinja
  // a la configuración mediante UVEngine y navega al resultado.
  async function generateArtifact() {
    if (!configuration || !worker || !isImported) return;

    setMessage({
      type: "info",
      msg: "Generando el resultado, por favor espera...",
    });

    try {
      const templateContent = await getTemplateContent();
      if (!templateContent) {
        setMessage(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        const fileName = selectedFile.name;
        const extensionIndexStart = fileName.indexOf(".") + 1;
        const fileExtension = fileName.substring(
          extensionIndexStart,
          fileName.length
        );

        worker.postMessage({
          action: "generateArtifact",
          data: {
            modelExtension: fileExtension,
            fileContent: fileContent,
            configuration: configuration,
            templateContent: templateContent,
          },
        });
      };
      reader.readAsText(selectedFile);

      worker.onmessage = async (event) => {
        if (event.data.results) {
          const generated = event.data.results;
          navigate("/result", { state: { prompt: generated } });
        } else if (event.data.error) {
          setMessage({
            type: "error",
            msg: "Error al generar el resultado: " + event.data.error,
          });
        }
      };
    } catch (error) {
      setMessage({
        type: "error",
        msg: error.toString(),
      });
    }
  }

  useEffect(() => {
    if (!configuration || !worker || !isImported) return;
    if (applyURL) {
      applyConfiguration();
    } else if (hasTemplate) {
      generateArtifact();
    }
    // Sin plantilla (modo full sin subida): se muestra la configuración para
    // revisarla y descargarla; no se genera ningún artefacto automáticamente.
  }, [configuration]);

  async function nextQuestion() {
    if (isImported && currentQuestion) {
      await answerQuestion();
    } else if (applyURL) {
      applyConfiguration();
    } else if (hasTemplate) {
      generateArtifact();
    } else {
      downloadConfiguration();
    }
  }

  async function previousQuestion() {
    if (isImported) {
      await undoAnswer();
    }
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Main content area */}
      <div className="bg-neutral-300 flex flex-col flex-grow rounded-2xl m-2 p-4 overflow-auto">
        {message && <Information type={message.type} msg={message.msg} />}
        {currentQuestion && (
          <Question
            title={currentQuestion.currentQuestion}
            attrs={currentQuestion.currentQuestionAttrs}
            options={currentQuestion.possibleOptions}
            questionType={currentQuestion.currentQuestionType}
            selected={selectedAnswer}
            onUpdate={setSelectedAnswer}
          />
        )}
        {configuration && !willGenerate && (
          <Configuration
            configuration={configuration}
            onUpdate={updateConfigurationValue}
          />
        )}
      </div>

      {/* Footer with buttons */}
      <div className="flex justify-between p-4">
        <CustomButton
          onClick={() => {
            if (cancelURL?.startsWith("http")) {
              window.location.href = cancelURL;
            } else {
              navigate("/");
            }
          }}
        >
          Cancelar
        </CustomButton>
        <div className="flex gap-2">
          {currentQuestion && (
            <CustomButton active={isImported} onClick={() => previousQuestion()}>
              Anterior
            </CustomButton>
          )}
          <CustomButton
            active={isImported}
            onClick={() => {
              nextQuestion();
            }}
          >
            {configuration
              ? applyURL
                ? isApplied
                  ? "Ver configuración"
                  : "Aplicar configuración"
                : hasTemplate
                ? "Generar resultado"
                : "Descargar configuración"
              : "Siguiente"}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

export default Wizzard;
