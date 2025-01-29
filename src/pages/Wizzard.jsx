import { useState } from "react";
import CustomButton from "../components/CustomButton";
import Question from "../components/Question";
import { useNavigate } from "react-router-dom";

function Wizzard() {
  const navigate = useNavigate();

  // Mock update handler
  const [questionIndex, setQuestionIndex] = useState(0);
  const handleUpdate = (selected) => {
    console.log("Selected options:", selected);
  };

  const mockQuestions = [
    {
      title: "Pick an alternative for 'Cultivo':",
      questionType: "alternative",
      options: ["Lechuga", "Tomate"],
    },
    {
      title: "Select the optional features for 'Ctes. de configuración':",
      questionType: "optional",
      options: ["Goteros por m2", "Caudal del gotero"],
      propagation: {
        type: "propagation",
        msg: "Based on your previous choices, the following features have been automatically selected: Capacidad de campo, Punto de marchitez, Temperatura base, Temperatura umbral, Fecha de plantado",
      },
    },
    {
      title: "Pick an alternative for 'Capacidad de campo':",
      questionType: "alternative",
      options: ["CC1", "CC2", "CC3"],
    },
    {
      title: "Pick an alternative for 'Punto de marchitez':",
      questionType: "alternative",
      options: ["PM1", "PM2", "PM3", "PM4"],
    },
    {
      title: "Pick an alternative for 'Temperatura Base':",
      questionType: "alternative",
      options: ["TB1", "TB2", "TB3", "TB4", "TB5"],
    },
    {
      title: "Select at least one feature for ‘Variables de salida’:",
      questionType: "or",
      options: [
        "GDD",
        "SGDD",
        "Cobertura",
        "KC",
        "ETc",
        "DAS",
        "DASp",
        "Balance de agua",
        "Recomendacion",
        "Fase del cultivo",
      ],
    },
    {
      title: "Select at least one feature for ‘Variables de salida’:",
      questionType: "or",
      options: [
        "GDD",
        "SGDD",
        "Cobertura",
        "KC",
        "ETc",
        "DAS",
        "DASp",
        "Balance de agua",
        "Recomendacion",
        "Fase del cultivo",
      ],
      propagation: {
        type: "error",
        msg: "There is an incompatibility between: ‘SGDD’, ‘Fase del cultivo’. Please try again.",
      },
    },
    {
      title: "Select the optional features for 'Variables de entrada':",
      questionType: "optional",
      options: ["Previsiones climáticas"],
      propagation: {
        type: "propagation",
        msg: "Based on your previous choices, the following options have been automatically selected:TMaxDiaria, TMinDiaria, Eto, Precipitación, Potencial de suelo",
      },
    },
    {
      title: "Pick an alternative for 'Sincronización':",
      questionType: "alternative",
      options: ["Diaria", "Semanal"],
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Main content area */}
      <div className="bg-neutral-300 flex flex-col  flex-grow rounded-2xl m-2 p-4">
        <Question
          title={mockQuestions[questionIndex].title}
          options={mockQuestions[questionIndex].options}
          questionType={mockQuestions[questionIndex].questionType}
          propagation={
            mockQuestions[questionIndex]?.propagation
              ? mockQuestions[questionIndex].propagation
              : null
          }
          onUpdate={handleUpdate}
        />
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
              if (questionIndex > 0) setQuestionIndex(questionIndex - 1);
            }}
          >
            Previous
          </CustomButton>
          <CustomButton
            onClick={() => {
              if (questionIndex < mockQuestions.length - 1)
                setQuestionIndex(questionIndex + 1);
              else navigate("/overview");
            }}
          >
            Next
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

export default Wizzard;
