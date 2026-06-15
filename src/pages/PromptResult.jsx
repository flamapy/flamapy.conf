import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";

function PromptResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { prompt: initialPrompt } = location.state || { prompt: "" };

  // Feature toggle: cuando el configurador está activo, el texto se genera
  // automáticamente y se muestra en solo lectura; si no, el usuario lo escribe.
  const useConfigurator = import.meta.env?.VITE_USE_CONFIGURATOR !== "false";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "prompt.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 bg-neutral-100 overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col h-full bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 p-6 flex flex-col overflow-hidden relative">
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <h2 className="text-lg font-bold text-neutral-800">
              {useConfigurator ? "Texto generado" : "Introduce el texto"}
            </h2>
            <CustomButton onClick={handleCopy} active={prompt !== ""}>
              {copied ? "¡Copiado!" : "Copiar"}
            </CustomButton>
          </div>

          <div className="flex-1 min-h-0 bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden mb-6 relative">
            {useConfigurator ? (
              <div className="w-full h-full p-4 overflow-y-auto font-mono text-sm text-neutral-800 whitespace-pre-wrap">
                {prompt || (
                  <span className="text-neutral-400 italic">
                    No se ha generado ningún texto. Por favor, vuelve al
                    configurador.
                  </span>
                )}
              </div>
            ) : (
              <textarea
                className="w-full h-full p-4 resize-none bg-transparent focus:outline-none focus:ring-2 focus:ring-[#356C99] font-mono text-sm text-neutral-800"
                placeholder="Escribe tu texto aquí..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            )}
          </div>

          <div className="flex-shrink-0 flex items-center justify-between border-t border-neutral-200 pt-4 mt-auto">
            <div className="flex gap-4">
              {useConfigurator && (
                <CustomButton onClick={() => navigate(-1)}>Volver</CustomButton>
              )}
              <CustomButton onClick={() => navigate("/")}>
                Volver al inicio
              </CustomButton>
            </div>
            <CustomButton onClick={handleDownload} active={prompt !== ""}>
              Descargar
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromptResult;
