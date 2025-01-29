import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-neutral-300 flex flex-col items-center justify-center h-screen rounded-2xl m-2 p-4 gap-4">
      {/* Título */}
      <p className="text-lg font-semibold">
        Select the feature model to configure
      </p>

      {/* Botón para subir modelo */}
      <CustomButton onClick={null}>Upload Model</CustomButton>

      {/* Selección del formato */}
      <p className="text-lg font-semibold">Select configuration format</p>
      <select className="p-2 border rounded w-max text-white py-2 px-4 m-2 shadow-lg transition-colors duration-200 bg-[#356C99] hover:bg-[#0D486C]">
        <option defaultValue>JSON</option>
      </select>

      {/* Instrucciones finales */}
      <p className="text-lg font-semibold">
        Once the configuration is finished:
      </p>
      <div className="flex flex-col gap-2">
        {/* Descarga */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="download" name="download" />
          <label htmlFor="download">Download configuration file</label>
        </div>

        {/* Enviar a */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="send" name="send" />
          <label htmlFor="send">Send to:</label>
          <input
            type="text"
            className="p-2 rounded border border-gray-400"
            placeholder="Enter email or address"
          />
        </div>
      </div>

      {/* Botón para empezar configuración */}
      <CustomButton onClick={() => navigate("/wizzard")}>
        Start Configuration
      </CustomButton>
    </div>
  );
}

export default Home;
