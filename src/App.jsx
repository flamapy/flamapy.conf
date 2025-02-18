import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Wizzard from "./pages/Wizzard";
import Overview from "./pages/Overview";
import End from "./pages/End";

const appMode = import.meta.env.VITE_FLAMAPY_CONF_MODE;
const cancelURL = appMode === 'embed' ? import.meta.env.VITE_CANCEL_CONFIGURATION_URL: null
const applyURL = appMode === 'embed' ? import.meta.env.VITE_APPLY_CONFIGURATION_URL: null

function App() {
  return (
    <BrowserRouter basename="/configurator">
      <div className="h-screen w-screen flex flex-col max-h-screen">
        <Navbar />
        <Routes>
          {appMode === 'full' && <Route path="/" element={<Home />}></Route>}
          <Route path="/wizzard" element={<Wizzard cancelURL={cancelURL} />}></Route>
          <Route path="/overview" element={<Overview applyURL={applyURL}/>}></Route>
          {appMode === 'full' && <Route path="/end" element={<End />}></Route>}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
