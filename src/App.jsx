import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Wizzard from "./pages/Wizzard";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <BrowserRouter basename="/">
      <div className="h-screen w-screen flex flex-col">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={<Home setSelectedFile={setSelectedFile} />}
          ></Route>

          <Route
            path={"/wizzard"}
            element={<Wizzard selectedFile={selectedFile} />}
          ></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
