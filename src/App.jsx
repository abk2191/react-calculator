import { useState } from "react";

function App() {
  const [opvalue, setOpvalue] = useState("");
  const [result, setResult] = useState("");

  function calculateExpression() {
    setOpvalue("");
    try {
      if (opvalue.trim() === "") {
        setResult("");
        return;
      }

      // First remove spaces for calculation
      let expression = opvalue
        .replace(/\s+/g, "") // Remove all spaces
        .replace(/x/g, "*")
        .replace(/÷/g, "/")
        .replace(/%/g, "/100");

      // Use eval (with caution - okay for calculator app)
      const calculatedResult = eval(expression);
      setResult(calculatedResult.toString());
    } catch (error) {
      setResult("Error");
    }
  }

  function displayOperations(value) {
    if (value === "C") {
      setOpvalue("");
      setResult("");
      return;
    }

    // Check if the value is an operator that needs spaces
    const operators = ["%", "÷", "x", "-", "+"];
    let formattedValue = value;

    if (operators.includes(value)) {
      formattedValue = ` ${value} `;
    }

    setOpvalue((prevValue) => {
      if (prevValue === null || prevValue === "") {
        return formattedValue;
      }
      return prevValue + formattedValue;
    });
  }

  // Function to render the operation display with colored operators
  function renderOperationDisplay() {
    const operators = ["%", "÷", "x", "-", "+"];

    // If there's no value, return empty paragraph
    if (!opvalue) {
      return (
        <p
          style={{ color: "white", fontFamily: "Inter, sans-serif" }}
          className="operation-display"
        ></p>
      );
    }

    // Split the expression by operators and keep the operators
    const parts = opvalue
      .split(/([+\-x÷%])/)
      .filter((part) => part.trim() !== "");

    return (
      <p
        style={{ color: "white", fontFamily: "Inter, sans-serif" }}
        className="operation-display"
      >
        {parts.map((part, index) => {
          if (operators.includes(part.trim())) {
            // Render operators in green
            return (
              <span key={index} style={{ color: "greenyellow" }}>
                {part}
              </span>
            );
          }
          // Render numbers in white
          return (
            <span key={index} style={{ color: "white" }}>
              {part}
            </span>
          );
        })}
      </p>
    );
  }

  return (
    <>
      <div className="calculator-container">
        <div className="display">
          <div className="expression-display" style={{ fontSize: "35px" }}>
            {renderOperationDisplay()}
          </div>
          <div className="result">
            <p
              key={result}
              className="result-text animate__animated animate__zoomIn"
              style={{
                color: "greenyellow",
                fontSize: "60px",
                fontWeight: "bold",
                fontFamily: "Inter, sans-serif",
                "--animate-duration": "0.25s",
              }}
            >
              {result}
            </p>
          </div>
        </div>
        <div className="keyboarrd">
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "rgb(84, 84, 84)", color: "white" }}
              onClick={() => displayOperations("C")}
            >
              C
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "rgb(84, 84, 84)", color: "white" }}
            >
              ( )
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "rgb(84, 84, 84)", color: "white" }}
              onClick={() => displayOperations("%")}
            >
              %
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("÷")}
            >
              ÷
            </button>
          </div>
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("7")}
            >
              7
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("8")}
            >
              8
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("9")}
            >
              9
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("x")}
            >
              x
            </button>
          </div>
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("4")}
            >
              4
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("5")}
            >
              5
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("6")}
            >
              6
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("-")}
            >
              -
            </button>
          </div>
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("1")}
            >
              1
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("2")}
            >
              2
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("3")}
            >
              3
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("+")}
            >
              +
            </button>
          </div>
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
            >
              +/-
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("0")}
            >
              0
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
            >
              .
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "green", color: "white" }}
              onClick={() => calculateExpression()}
            >
              =
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
