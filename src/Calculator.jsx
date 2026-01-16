import { useState } from "react";

function Calculator() {
  const [opvalue, setOpvalue] = useState("");
  const [result, setResult] = useState("");
  const [lastWasEquals, setLastWasEquals] = useState(false);

  function calculateExpression() {
    setOpvalue("");
    setLastWasEquals(true);
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

      // Format to maximum 5 decimal places
      let resultStr;

      if (Number.isInteger(calculatedResult)) {
        resultStr = calculatedResult.toString();
      } else {
        // Round to 5 decimal places
        const rounded = Math.round(calculatedResult * 100000) / 100000;
        // Convert to string and remove trailing zeros
        resultStr = parseFloat(rounded.toString()).toString();
      }

      setResult(resultStr);
    } catch (error) {
      setResult("Error");
      setLastWasEquals(false);
    }
  }

  function displayOperations(value) {
    setResult("");
    if (value === "C") {
      setOpvalue("");
      setResult("");
      setLastWasEquals(false);
      return;
    }

    // Handle parentheses
    if (value === "( )") {
      setOpvalue((prevValue) => {
        // Check if we've reached 50 characters
        if (prevValue.length >= 50) {
          return prevValue;
        }

        // If we just got a result, start fresh with the result
        if (lastWasEquals && result) {
          setLastWasEquals(false);
          return result + "(";
        }

        // Count parentheses in the current expression
        const openParens = (prevValue.match(/\(/g) || []).length;
        const closeParens = (prevValue.match(/\)/g) || []).length;

        if (openParens <= closeParens) {
          // Add opening parenthesis (we need more opens)
          return prevValue + "(";
        } else {
          // Add closing parenthesis (we have more opens than closes)
          return prevValue + ")";
        }
      });
      return;
    }

    // Check if the value is an operator that needs spaces
    const operators = ["%", "÷", "x", "-", "+"];

    // If we just pressed equals and have a result, start new expression with result
    if (lastWasEquals && result && operators.includes(value)) {
      setOpvalue(result + ` ${value} `);
      setLastWasEquals(false);
      return;
    }

    // If we just pressed equals and user enters a number or dot, start fresh
    if (
      lastWasEquals &&
      result &&
      !operators.includes(value) &&
      value !== "( )"
    ) {
      setOpvalue(value);
      setLastWasEquals(false);
      return;
    }

    let formattedValue = value;

    if (operators.includes(value)) {
      formattedValue = ` ${value} `;
    }

    setOpvalue((prevValue) => {
      // Check if adding this value would exceed 50 characters
      const newValueLength = prevValue.length + formattedValue.length;
      if (newValueLength > 50) {
        return prevValue; // Don't add the new value
      }

      if (prevValue === null || prevValue === "") {
        return formattedValue;
      }
      return prevValue + formattedValue;
    });
    setLastWasEquals(false);
  }

  // Function to render the operation display with colored operators
  function renderOperationDisplay() {
    const operators = ["%", "÷", "x", "-", "+"];

    if (!opvalue) {
      return null;
    }

    // Just render the opvalue as-is, but color the operators
    // We'll use a character-by-character approach
    return (
      <p
        style={{ color: "white", fontFamily: "Inter, sans-serif" }}
        className="operation-display"
      >
        {opvalue.split("").map((char, index) => {
          const trimmedChar = char.trim();
          if (operators.includes(trimmedChar)) {
            return (
              <span key={index} style={{ color: "greenyellow" }}>
                {char}
              </span>
            );
          }
          return (
            <span key={index} style={{ color: "white" }}>
              {char}
            </span>
          );
        })}
      </p>
    );
  }

  function handleDelete() {
    setOpvalue((prevValue) => {
      if (!prevValue || prevValue.trim() === "") {
        return "";
      }

      // Trim the value to handle trailing spaces
      const trimmedValue = prevValue.trim();

      // Check what we're deleting
      const lastChar = prevValue.slice(-1);
      const lastThreeChars = prevValue.slice(-3);

      // Check if we're deleting an operator with spaces
      if (prevValue.endsWith(" ")) {
        // Check if it's an operator with spaces (like " + ", " - ", etc.)
        const operatorsWithSpaces = [" + ", " - ", " x ", " ÷ ", " % "];

        if (operatorsWithSpaces.some((op) => lastThreeChars === op)) {
          // Remove the operator with spaces
          return prevValue.slice(0, -3);
        } else {
          // Just remove trailing space
          return prevValue.trimEnd();
        }
      } else {
        // Remove just the last character
        return prevValue.slice(0, -1);
      }
    });

    // Clear the result when deleting (optional but recommended)
    setResult("");
    setLastWasEquals(false);
  }

  function handlePlusMinus() {
    setOpvalue((prevValue) => {
      if (!prevValue || prevValue.trim() === "") {
        // If we have a result from equals, use that
        if (lastWasEquals && result) {
          setLastWasEquals(false);
          return "(-" + result + ")";
        }
        return prevValue;
      }

      // Simple approach: Find where the last number starts
      const trimmed = prevValue.trim();
      const operators = ["+", "-", "x", "÷", "%", " "];

      // Find the start of the last number by looking backwards
      let i = trimmed.length - 1;
      while (
        i >= 0 &&
        !operators.includes(trimmed[i]) &&
        trimmed[i] !== "(" &&
        trimmed[i] !== ")"
      ) {
        i--;
      }

      // i is now at the character before the last number starts
      const beforeNum = trimmed.substring(0, i + 1);
      const lastNum = trimmed.substring(i + 1);

      // Check if the last number is already negative
      if (lastNum.startsWith("(-") && lastNum.endsWith(")")) {
        // Remove the negative wrapper
        const positiveNum = lastNum.substring(2, lastNum.length - 1);
        return beforeNum + positiveNum;
      } else {
        // Wrap the number in (- ... )
        const newValue = beforeNum + "(-" + lastNum + ")";
        // Check if this would exceed 50 characters
        if (newValue.length > 50) {
          return prevValue;
        }
        return newValue;
      }
    });
    setLastWasEquals(false);
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
          <span
            style={{
              color: "rgb(57, 57, 57)",
              marginBottom: "0px",
              margin: "0",
              padding: "0",
            }}
          >
            _______________________________________________
          </span>
          <div className="delete-btn-div">
            <button className="delete-button" onClick={handleDelete}>
              <i className="fa-solid fa-delete-left"></i>
            </button>
          </div>
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "rgb(57, 57, 57)", color: "white" }}
              onClick={() => displayOperations("C")}
            >
              C
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "rgb(57, 57, 57)", color: "white" }}
              onClick={() => displayOperations("( )")}
            >
              ( )
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "rgb(57, 57, 57)", color: "white" }}
              onClick={() => displayOperations("%")}
            >
              %
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("÷")}
            >
              <i className="fa-solid fa-divide"></i>
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
              <i className="fa-solid fa-xmark"></i>
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
              <i className="fa-solid fa-minus"></i>
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
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={handlePlusMinus}
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
              onClick={() => displayOperations(".")}
            >
              .
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "green", color: "white" }}
              onClick={calculateExpression}
            >
              =
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Calculator;
