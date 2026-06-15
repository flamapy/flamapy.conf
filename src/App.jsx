import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Wizzard from "./pages/Wizzard";
import PromptResult from "./pages/PromptResult";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [applyURL, setApplyURL] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);

  // Feature toggle: si es 'false', se omite el configurador y se va
  // directamente a la pantalla de resultado (entrada manual de texto).
  const useConfigurator = import.meta.env?.VITE_USE_CONFIGURATOR !== "false";

  return (
    <BrowserRouter basename={import.meta.env?.VITE_BASENAME}>
      <div className="h-screen w-screen flex flex-col">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              useConfigurator ? (
                <Home
                  setSelectedFile={setSelectedFile}
                  setApplyURL={setApplyURL}
                  setTemplateFile={setTemplateFile}
                />
              ) : (
                <Navigate to="/result" replace />
              )
            }
          ></Route>

          <Route
            path={"/wizzard"}
            element={
              useConfigurator ? (
                <Wizzard
                  selectedFile={selectedFile}
                  applyURL={applyURL}
                  templateFile={templateFile}
                />
              ) : (
                <Navigate to="/result" replace />
              )
            }
          ></Route>

          <Route path="/result" element={<PromptResult />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
