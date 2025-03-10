/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import CustomButton from "../components/CustomButton";
import Question from "../components/Question";
import { useNavigate } from "react-router-dom";

function Wizzard({cancelURL = '/', selectedFile}) {
  const [worker, setWorker] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [output, setOutput] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null)

  const navigate = useNavigate();

  function initializeWorker() {
    const flamapyWorker = new Worker("/webworker.js");
    flamapyWorker.onmessage = (event) => {
      if (event.data.status === "loaded") {
        setIsLoaded(true);
        setOutput('flamapy ready')
        setOutput(selectedFile.name)
      } else {setOutput('flamapy error')}
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
      setOutput(error.toString());
    }
  }, []);

  useEffect(()=>{ 
    console.log(output);
  }, [output])

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
            setOutput('model imported')
          } else if (event.data.error) {
            if (event.data.error.includes("not_supported")) {
              setOutput("Import error The provided file extension is not a supported model. Please try with a model in one of the following types: .gfm.json, .afm, .fide, .json, .xml or .uvl");
            } else {
              setOutput({
                label: "Import error",
                result: `There was an error when trying to import the model. Please make sure that the model is valid, and try again.`,
              });
            }
            setIsImported(true);
          }
        };
      };
      reader.readAsText(selectedFile);
    }
  }, [isLoaded, worker, selectedFile]);

  useEffect(()=>{ 
    if (isImported) {
      worker.postMessage({
          action: "startConfigurator",
          data: null,
        });
      
      worker.onmessage = async (event) => {
          if (event.data.results !== undefined) {
            setOutput(event.data.results)
            setCurrentQuestion(event.data.results)
          }
        };
    }
    console.log(output);
  }, [isImported])

  // Mock update handler
  const handleUpdate = (selected) => {
    console.log("Selected options:", selected);
  };


  return (
    <div className="flex flex-col h-screen">
      {/* Main content area */}
      <div className="bg-neutral-300 flex flex-col  flex-grow rounded-2xl m-2 p-4">
        {currentQuestion && 
        <Question
          title={currentQuestion.currentQuestion}
          options={currentQuestion.possibleOptions}
          questionType={currentQuestion.currentQuestionType}
          propagation={null}
          onUpdate={handleUpdate}
        />}
      </div>

      {/* Footer with buttons */}
      <div className="flex justify-between p-4">
        <CustomButton
          onClick={() => {
            if (cancelURL.startsWith("http")) {
              window.location.href = cancelURL; // Redirects to external URL
            } else {
              navigate(cancelURL); // Internal navigation
            }}}
        >
          Cancel
        </CustomButton>
        <div>
          <CustomButton
            onClick={() => {
              if (questionIndex > 0) setQuestionIndex(questionIndex - 1);
            }}
          >
            Previous
          </CustomButton>
          <CustomButton
            onClick={() => {
              if (questionIndex < 10 - 1)
                setQuestionIndex(questionIndex + 1);
              else navigate("/overview");
            }}
          >
            Next
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

export default Wizzard;
