import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Wizzard from "./pages/Wizzard";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [applyURL, setApplyURL] = useState(null);

  return (
    <BrowserRouter basename={import.meta.env?.VITE_BASENAME}>
      <div className="h-screen w-screen flex flex-col">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                setSelectedFile={setSelectedFile}
                setApplyURL={setApplyURL}
              />
            }
          ></Route>

          <Route
            path={"/wizzard"}
            element={
              <Wizzard selectedFile={selectedFile} applyURL={applyURL} />
            }
          ></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
