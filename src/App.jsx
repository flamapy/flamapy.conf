import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Wizzard from "./pages/Wizzard";
import Overview from "./pages/Overview";
import End from "./pages/End";

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-screen flex flex-col max-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/wizzard" element={<Wizzard />}></Route>
          <Route path="/overview" element={<Overview />}></Route>
          <Route path="/end" element={<End />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
