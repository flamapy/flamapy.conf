/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import CustomButton from "../components/CustomButton";
import Question from "../components/Question";
import { useNavigate } from "react-router-dom";
import Information from "../components/Information";
import Configuration from "../components/Configuration";

function Wizzard({ cancelURL = "/", selectedFile }) {
  const [worker, setWorker] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState([]);
  const [popUp, setPopUp] = useState({
    type: "info",
    msg: `Preparing configurator for ${selectedFile.name}`,
  });
  const [configuration, setConfiguration] = useState(null);

  const navigate = useNavigate();

  function initializeWorker() {
    const flamapyWorker = new Worker("/webworker.js");
    flamapyWorker.onmessage = (event) => {
      if (event.data.status === "loaded") {
        setIsLoaded(true);
      } else {
        setPopUp({
          type: "error",
          msg: `There was an error initializing the configurator`,
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
      setPopUp({
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
              setPopUp({
                type: "error",
                msg: "Import error: the provided file extension is not a supported model. Please try with a model in one of the following types: .gfm.json, .afm, .fide, .json, .xml or .uvl",
              });
            } else {
              setPopUp({
                type: "error",
                msg: "There was an error when trying to import the model. Please make sure that the model is valid, and try again.",
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
          setPopUp(null);
          setCurrentQuestion(event.data.results);
        }
      };
    }
  }, [isImported]);

  async function answerQuestion() {
    if (isImported) {
      worker.postMessage({ action: "answerQuestion", data: selectedAnswer });

      worker.onmessage = async (event) => {
        if (event.data.results !== undefined) {
          const results = event.data.results;
          if (results.valid) {
            if (results.configuration) {
              setConfiguration(results.configuration);
              setPopUp({
                type: "success",
                msg: "Configuration finished successfully",
              });
              setCurrentQuestion(null);
            } else {
              setCurrentQuestion(event.data.results.nextQuestion);
              setPopUp(null);
            }
          } else {
            setPopUp({ type: "error", msg: results.contradiction.msg });
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

  function downloadConfiguration() {
    if (!configuration) {
      setPopUp({
        type: "error",
        msg: "No configuration available to download.",
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

  async function nextQuestion() {
    if (isImported && currentQuestion) {
      await answerQuestion();
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
        {popUp && <Information type={popUp.type} msg={popUp.msg} />}
        {currentQuestion && (
          <Question
            title={currentQuestion.currentQuestion}
            options={currentQuestion.possibleOptions}
            questionType={currentQuestion.currentQuestionType}
            selected={selectedAnswer}
            onUpdate={setSelectedAnswer}
          />
        )}
        {configuration && <Configuration configuration={configuration} />}
      </div>

      {/* Footer with buttons */}
      <div className="flex justify-between p-4">
        <CustomButton
          onClick={() => {
            if (cancelURL.startsWith("http")) {
              window.location.href = cancelURL; // Redirects to external URL
            } else {
              navigate(cancelURL); // Internal navigation
            }
          }}
        >
          Cancel
        </CustomButton>
        <div>
          <CustomButton
            active={isImported}
            onClick={() => {
              previousQuestion();
            }}
          >
            Previous
          </CustomButton>
          <CustomButton
            active={isImported}
            onClick={() => {
              nextQuestion();
            }}
          >
            {configuration ? "Download configuration" : "Next"}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

export default Wizzard;
