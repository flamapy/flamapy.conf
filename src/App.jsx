import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Wizzard from "./pages/Wizzard";

const appMode = import.meta.env.VITE_FLAMAPY_CONF_MODE;
const cancelURL =
  appMode === "embed" ? import.meta.env.VITE_CANCEL_CONFIGURATION_URL : null;
const applyURL =
  appMode === "embed" ? import.meta.env.VITE_APPLY_CONFIGURATION_URL : null;

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <BrowserRouter basename="/">
      <div className="h-screen w-screen flex flex-col max-h-screen">
        <Navbar />
        <Routes>
          {appMode === "full" && (
            <Route
              path="/"
              element={<Home setSelectedFile={setSelectedFile} />}
            ></Route>
          )}
          <Route
            path="/wizzard"
            element={
              <Wizzard cancelURL={cancelURL} selectedFile={selectedFile} />
            }
          ></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
