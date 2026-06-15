/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import { useSearchParams } from "react-router";

function Home({ setSelectedFile, setApplyURL, setTemplateFile }) {
  const appMode = import.meta.env?.VITE_FLAMAPY_CONF_MODE;
  const modelName = import.meta.env?.VITE_FEATURE_MODEL_NAME;

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [fetchError, setFetchError] = useState(false);

  const modelURL =
    import.meta.env?.VITE_FEATURE_MODEL_URL || searchParams.get("modelURL");

  useEffect(() => {
    console.log(appMode);

    setApplyURL(searchParams.get("applyURL"));
  }, [searchParams]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleTemplateChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTemplateFile(file);
      setTemplateName(file.name);
    }
  };

  const clearTemplate = () => {
    setTemplateFile(null);
    setTemplateName("");
  };

  const handleModelImport = (url) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch model");
        }
        return response.blob();
      })
      .then((blob) => {
        const urlParts = url.split(".");
        const fileExtension = urlParts[urlParts.length - 1];
        const file = new File([blob], `${modelName}.${fileExtension}`, {
          type: blob.type,
        });
        setSelectedFile(file);
        navigate("/wizzard");
      })
      .catch(() => {
        setFetchError(true);
      });
  };

  return (
    <div className="bg-neutral-300 flex flex-col items-center justify-center h-screen rounded-2xl m-2 p-4 gap-4">
      <p className="text-lg font-semibold">
        {appMode === "full"
          ? "Selecciona el modelo de características a configurar"
          : `Bienvenido/a a ${modelName}`}
      </p>
      {appMode !== "full" && (
        <div className="text-sm text-gray-700 max-w-xl text-center space-y-2">
          <p>
            Esta herramienta te guiará paso a paso para configurar un modelo de
            características y generar un <strong>resultado</strong> personalizado
            a partir de tus elecciones.
          </p>
          <p>
            En cada pantalla verás una pregunta o un conjunto de opciones.{" "}
            <strong>
              Selecciona o rellena únicamente los campos que consideres
              necesarios
            </strong>{" "}
            para describir lo que quieres conseguir. No hay respuestas correctas
            o incorrectas: elige lo que mejor se adapte a tu objetivo.
          </p>
          <p>
            Al finalizar, se generará automáticamente el resultado con tus
            elecciones.
          </p>
        </div>
      )}

      {appMode === "full" ? (
        <>
          {/* Modelo de características (obligatorio) */}
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <CustomButton
            onClick={() => document.getElementById("fileInput").click()}
          >
            Importar modelo
          </CustomButton>
          {fileName && (
            <p className="text-sm text-gray-700">
              Archivo seleccionado: {fileName}
            </p>
          )}

          {/* Plantilla Jinja de transformación M2T (opcional) */}
          <input
            type="file"
            id="templateInput"
            accept=".jinja,.j2,.txt,.tpl"
            onChange={handleTemplateChange}
            style={{ display: "none" }}
          />
          <CustomButton
            onClick={() => document.getElementById("templateInput").click()}
          >
            Importar plantilla (opcional)
          </CustomButton>
          {templateName ? (
            <p className="text-sm text-gray-700">
              Plantilla seleccionada: {templateName}{" "}
              <button
                onClick={clearTemplate}
                className="ml-2 text-xs text-red-600 underline"
              >
                quitar
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-500 max-w-md text-center">
              Si subes una plantilla Jinja, la configuración se transformará a
              texto (M2T). Si no, podrás revisar y descargar la configuración.
            </p>
          )}

          {fileName && (
            <CustomButton onClick={() => navigate("/wizzard")}>
              Iniciar configuración
            </CustomButton>
          )}
        </>
      ) : fetchError ? (
        <p className="text-red-500">
          Error al obtener el modelo. Por favor, inténtalo de nuevo.
        </p>
      ) : (
        <CustomButton onClick={() => handleModelImport(modelURL)}>
          Iniciar configuración
        </CustomButton>
      )}
    </div>
  );
}

export default Home;
