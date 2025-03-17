/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";

function Home({ setSelectedFile }) {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  return (
    <div className="bg-neutral-300 flex flex-col items-center justify-center h-screen rounded-2xl m-2 p-4 gap-4">
      {/* Título */}
      <p className="text-lg font-semibold">
        Select the feature model to configure
      </p>

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
        <p className="text-sm text-gray-700">Selected file: {fileName}</p>
      )}

      <p className="text-lg font-semibold">Select configuration format</p>
      <select className="p-2 border rounded w-max text-white py-2 px-4 m-2 shadow-lg transition-colors duration-200 bg-[#356C99] hover:bg-[#0D486C]">
        <option defaultValue>JSON</option>
      </select>

      <CustomButton onClick={() => navigate("/wizzard")}>
        Start Configuration
      </CustomButton>
    </div>
  );
}

export default Home;
