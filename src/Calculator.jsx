import { useState, useEffect } from "react";

function Calculator() {
  const [opvalue, setOpvalue] = useState(""); // Store without commas
  const [displayValue, setDisplayValue] = useState(""); // Display with commas
  const [result, setResult] = useState("");
  const [lastWasEquals, setLastWasEquals] = useState(false);
  const [renderCalculator, setRenderCalculator] = useState(true);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("calculator_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [isHistoryButtonActive, setIsHistoryButtonActive] = useState(false);
  const [isCalculatorButtonActive, setIsCalculatorButtonActive] =
    useState(false);

  useEffect(() => {
    localStorage.setItem("calculator_history", JSON.stringify(history));
  }, [history]);

  // Function to format numbers with commas (Indian numbering system)
  function formatNumberWithCommas(numberStr) {
    if (!numberStr) return "";

    // Remove any existing commas
    const numStr = numberStr.replace(/,/g, "");

    // Split into integer and decimal parts
    const parts = numStr.split(".");
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? "." + parts[1] : "";

    // Handle negative numbers
    let isNegative = false;
    if (integerPart.startsWith("-")) {
      isNegative = true;
      integerPart = integerPart.substring(1);
    }

    // Format integer part with commas (Indian numbering system)
    let lastThree = integerPart.substring(integerPart.length - 3);
    let otherNumbers = integerPart.substring(0, integerPart.length - 3);

    if (otherNumbers !== "") {
      lastThree = "," + lastThree;
    }

    let result = lastThree;
    let count = 0;

    for (let i = otherNumbers.length - 1; i >= 0; i--) {
      count++;
      result = otherNumbers.charAt(i) + result;
      if (count === 2 && i !== 0) {
        result = "," + result;
        count = 0;
      }
    }

    // Add negative sign back if needed
    if (isNegative) {
      result = "-" + result;
    }

    return result + decimalPart;
  }

  // Function to parse and format expression with commas
  function formatExpression(expression) {
    if (!expression) return "";

    // Split the expression by operators (keeping the operators)
    const operators = ["+", "-", "x", "÷", "%"];
    let formattedExpression = "";
    let currentNumber = "";

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      // Check if character is part of a number (digit, decimal point, or minus sign at start of number)
      if (
        /[\d.]/.test(char) ||
        (char === "-" && (i === 0 || /[+\-x÷%\s(]/.test(expression[i - 1])))
      ) {
        currentNumber += char;
      } else {
        // Format the accumulated number if exists
        if (currentNumber) {
          formattedExpression += formatNumberWithCommas(currentNumber);
          currentNumber = "";
        }

        // Add the non-number character (operator, space, parenthesis, etc.)
        formattedExpression += char;
      }
    }

    // Format any remaining number at the end
    if (currentNumber) {
      formattedExpression += formatNumberWithCommas(currentNumber);
    }

    return formattedExpression;
  }

  // Function to add calculation to history
  function addToHistory(expression, result) {
    const historyItem = {
      id: Date.now(),
      expression: expression,
      result: result,
    };

    setHistory((prevHistory) => [historyItem, ...prevHistory]);
  }

  function calculateExpression() {
    setDisplayValue("");
    setLastWasEquals(true);
    try {
      if (opvalue.trim() === "") {
        setResult("");
        return;
      }

      // First remove spaces for calculation (commas are already not in opvalue)
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

      // Format the result with commas
      const formattedResult = formatNumberWithCommas(resultStr);
      setResult(formattedResult);

      // Add to history
      addToHistory(displayValue, formattedResult);
    } catch (error) {
      setResult("Error");
      setLastWasEquals(false);
    }
  }

  function displayOperations(value) {
    setResult("");
    if (value === "C") {
      setOpvalue("");
      setDisplayValue("");
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
          // Remove commas from result for new expression
          const resultWithoutCommas = result.replace(/,/g, "");
          // Update display
          setDisplayValue(formatExpression(resultWithoutCommas + "("));
          return resultWithoutCommas + "(";
        }

        // Count parentheses in the current expression
        const openParens = (prevValue.match(/\(/g) || []).length;
        const closeParens = (prevValue.match(/\)/g) || []).length;

        let newOpvalue;
        if (openParens <= closeParens) {
          // Add opening parenthesis (we need more opens)
          newOpvalue = prevValue + "(";
        } else {
          // Add closing parenthesis (we have more opens than closes)
          newOpvalue = prevValue + ")";
        }

        // Update display with formatted value
        setDisplayValue(formatExpression(newOpvalue));
        return newOpvalue;
      });
      return;
    }

    // Check if the value is an operator that needs spaces
    const operators = ["%", "÷", "x", "-", "+"];

    // If we just pressed equals and have a result, start new expression with result
    if (lastWasEquals && result && operators.includes(value)) {
      // Remove commas from result for calculation
      const resultWithoutCommas = result.replace(/,/g, "");
      const newOpvalue = resultWithoutCommas + ` ${value} `;
      setOpvalue(newOpvalue);
      setDisplayValue(formatExpression(newOpvalue));
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
      setDisplayValue(formatExpression(value));
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

      const newOpvalue =
        prevValue === null || prevValue === ""
          ? formattedValue
          : prevValue + formattedValue;

      // Update display with formatted value
      setDisplayValue(formatExpression(newOpvalue));
      return newOpvalue;
    });
    setLastWasEquals(false);
  }

  // Function to render the operation display with colored operators
  function renderOperationDisplay() {
    const operators = ["%", "÷", "x", "-", "+"];

    if (!displayValue) {
      return null;
    }

    // Render the formatted expression with colored operators
    return (
      <p
        style={{ color: "white", fontFamily: "Inter, sans-serif" }}
        className="operation-display"
      >
        {displayValue.split("").map((char, index) => {
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
        setDisplayValue("");
        return "";
      }

      // Trim the value to handle trailing spaces
      const trimmedValue = prevValue.trim();

      // Check what we're deleting
      const lastChar = prevValue.slice(-1);
      const lastThreeChars = prevValue.slice(-3);

      let newOpvalue;

      // Check if we're deleting an operator with spaces
      if (prevValue.endsWith(" ")) {
        // Check if it's an operator with spaces (like " + ", " - ", etc.)
        const operatorsWithSpaces = [" + ", " - ", " x ", " ÷ ", " % "];

        if (operatorsWithSpaces.some((op) => lastThreeChars === op)) {
          // Remove the operator with spaces
          newOpvalue = prevValue.slice(0, -3);
        } else {
          // Just remove trailing space
          newOpvalue = prevValue.trimEnd();
        }
      } else {
        // Remove just the last character
        newOpvalue = prevValue.slice(0, -1);
      }

      // Update display with formatted value
      setDisplayValue(formatExpression(newOpvalue));
      return newOpvalue;
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
          // Remove commas from result for calculation
          const resultWithoutCommas = result.replace(/,/g, "");
          const newOpvalue = "(-" + resultWithoutCommas + ")";
          setDisplayValue(formatExpression(newOpvalue));
          return newOpvalue;
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

      // Remove commas from the number for calculation
      const lastNumWithoutCommas = lastNum.replace(/,/g, "");

      let newOpvalue;

      // Check if the last number is already negative
      if (
        lastNumWithoutCommas.startsWith("(-") &&
        lastNumWithoutCommas.endsWith(")")
      ) {
        // Remove the negative wrapper
        const positiveNum = lastNumWithoutCommas.substring(
          2,
          lastNumWithoutCommas.length - 1
        );
        newOpvalue = beforeNum + positiveNum;
      } else {
        // Wrap the number in (- ... )
        newOpvalue = beforeNum + "(-" + lastNumWithoutCommas + ")";
        // Check if this would exceed 50 characters
        if (newOpvalue.length > 50) {
          return prevValue;
        }
      }

      // Update display with formatted value
      setDisplayValue(formatExpression(newOpvalue));
      return newOpvalue;
    });
    setLastWasEquals(false);
  }

  return (
    <>
      <div className="brand">
        <h3
          style={{
            color: "gold",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <i class="fa-solid fa-flask"></i> Aphelion Labs.
        </h3>
      </div>
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

        <div className="container">
          <div className="divider-span">
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
          </div>
          <div className="container-two">
            <div className="operation-buttons-div">
              <div className="history-button-div">
                <button
                  className={`history-button ${
                    isHistoryButtonActive
                      ? "animate__animated animate__rubberBand"
                      : ""
                  }`}
                  onClick={() => {
                    setIsHistoryButtonActive(true);
                    setRenderCalculator(false);
                  }}
                  onAnimationEnd={() => setIsHistoryButtonActive(false)}
                >
                  <i class="fa-solid fa-clock-rotate-left"></i>
                </button>
              </div>

              <div className="calculator-button-div">
                <button
                  className={`calculator-button ${
                    isCalculatorButtonActive
                      ? "animate__animated animate__rubberBand"
                      : ""
                  }`}
                  onClick={() => {
                    setIsCalculatorButtonActive(true);
                    setRenderCalculator(true);
                  }}
                  onAnimationEnd={() => setIsCalculatorButtonActive(false)}
                >
                  <i class="fa-solid fa-calculator"></i>
                </button>
              </div>

              <div className="delete-btn-div">
                <button className="delete-button" onClick={handleDelete}>
                  <i className="fa-solid fa-delete-left"></i>
                </button>
              </div>
            </div>
          </div>

          {renderCalculator && (
            <div className="keyboarrd">
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
          )}

          {!renderCalculator && (
            <div className="history">
              {history.length === 0 ? (
                <p style={{ color: "gray", textAlign: "center" }}>
                  No calculations yet
                </p>
              ) : (
                <div className="history-list">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="history-item"
                      style={{
                        // marginBottom: "15px",
                        // paddingBottom: "10px",
                        borderBottom: "1px solid rgb(57, 57, 57)",
                      }}
                    >
                      <div className="history-list-items">
                        <p
                          style={{
                            color: "white",
                            // margin: "0 0 5px 0",
                            padding: "15px",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "20px",
                          }}
                        >
                          {item.expression} ={" "}
                          <span style={{ color: "greenyellow" }}>
                            {item.result}
                          </span>
                        </p>
                        {/* <p
                          style={{
                            color: "greenyellow",
                            margin: "0",
                            fontSize: "20px",
                            fontWeight: "bold",
                          }}
                        >
                          = {item.result}
                        </p> */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Calculator;
