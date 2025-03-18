/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";

function Home({ setSelectedFile }) {
  const appMode = import.meta.env?.VITE_FLAMAPY_CONF_MODE;
  const modelName = import.meta.env?.VITE_FEATURE_MODEL_NAME;
  const modelURL = import.meta.env?.VITE_FEATURE_MODEL_URL;

  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const [fetchError, setFetchError] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
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
          ? "Select the feature model to configure"
          : `From this page, you can start the configuration process for ${modelName}. Once finished, you can apply your configuration.`}
      </p>

      {appMode === "full" ? (
        <>
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <CustomButton
            onClick={() => document.getElementById("fileInput").click()}
          >
            Import Model
          </CustomButton>
          {fileName && (
            <>
              <p className="text-sm text-gray-700">Selected file: {fileName}</p>
              <CustomButton onClick={() => navigate("/wizzard")}>
                Start Configuration
              </CustomButton>
            </>
          )}
        </>
      ) : fetchError ? (
        <p className="text-red-500">
          Error fetching the model. Please try again.
        </p>
      ) : (
        <CustomButton onClick={() => handleModelImport(modelURL)}>
          Start Configuration
        </CustomButton>
      )}
    </div>
  );
}

export default Home;
