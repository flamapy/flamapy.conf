import CustomButton from "../components/CustomButton";
import { useNavigate } from "react-router-dom";

function Overview() {
  const navigate = useNavigate();
  const text = `Cultivo
\u2937 Lechuga
Ctes. de configuracion
\u2937 Capacidad de campo
    \u2937 CC1
\u2937 Punto de marchitez
    \u2937 PM2
\u2937 Temperatura base
    \u2937 TB1
Variables de salida
\u2937 Recomendación
Sincronización
\u2937 Diaria`;

  return (
    <div className="flex flex-col h-screen">
      {/* Main content area */}
      <div className="bg-neutral-300 flex flex-col  flex-grow rounded-2xl m-2 p-4 gap-4">
        <div className="bg-gray-700 w-full rounded-xl p-4 text-xl">
          <p className="text-lg font-semibold text-white">
            Configuration Overview
          </p>
        </div>
        <div className="bg-yellow-700 w-full rounded-xl p-4 text-xl">
          <p className="text-lg font-semibold text-white">
            You can still make changes by clicking on ‘Previous’. This will only
            undo the last selection.
          </p>
        </div>
        <div className="bg-white w-full rounded-xl p-4 text-xl">
          <pre className="text-lg font-semibold text-black">{text}</pre>
        </div>
      </div>

      {/* Footer with buttons */}
      <div className="flex justify-between p-4">
        <CustomButton
          onClick={() => {
            navigate("/");
          }}
        >
          Cancel
        </CustomButton>
        <div>
          <CustomButton
            onClick={() => {
              navigate("/wizzard");
            }}
          >
            Previous
          </CustomButton>
          <CustomButton
            onClick={() => {
              navigate("/end");
            }}
          >
            Apply
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

export default Overview;
