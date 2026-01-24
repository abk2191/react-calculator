import React, { useState, useEffect, useCallback, useMemo } from "react";

const OPERATORS = ["%", "÷", "x", "-", "+"];
const OPERATOR_DISPLAY_MAP = {
  "÷": "fa-divide",
  x: "fa-xmark",
  "-": "fa-minus",
  "+": "fa-plus",
};

function Calculator() {
  const [expression, setExpression] = useState(""); // Store without commas
  const [displayExpression, setDisplayExpression] = useState(""); // Display with commas
  const [result, setResult] = useState("");
  const [lastOperationWasEquals, setLastOperationWasEquals] = useState(false);
  const [showCalculator, setShowCalculator] = useState(true);
  const [calculationHistory, setCalculationHistory] = useState(() => {
    const savedHistory = localStorage.getItem("calculator_history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem("calculator_theme");
    return savedTheme ? JSON.parse(savedTheme) : true; // Default to dark theme
  });

  // Persist history and theme to localStorage
  useEffect(() => {
    localStorage.setItem(
      "calculator_history",
      JSON.stringify(calculationHistory),
    );
  }, [calculationHistory]);

  useEffect(() => {
    localStorage.setItem("calculator_theme", JSON.stringify(isDarkTheme));
    // Update body class for theme
    if (isDarkTheme) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [isDarkTheme]);

  /**
   * Formats a number string with commas according to Indian numbering system
   */
  const formatNumberWithCommas = useCallback((numberString) => {
    if (!numberString) return "";

    // Remove existing commas
    const cleanNumberString = numberString.replace(/,/g, "");

    const [integerPart, decimalPart] = cleanNumberString.split(".");
    let processedIntegerPart = integerPart;
    const formattedDecimalPart = decimalPart ? `.${decimalPart}` : "";

    // Handle negative numbers
    let isNegative = false;
    if (processedIntegerPart.startsWith("-")) {
      isNegative = true;
      processedIntegerPart = processedIntegerPart.substring(1);
    }

    // Indian numbering system: comma after last 3 digits, then every 2 digits
    const lastThreeDigits = processedIntegerPart.substring(
      processedIntegerPart.length - 3,
    );
    const remainingDigits = processedIntegerPart.substring(
      0,
      processedIntegerPart.length - 3,
    );

    let formattedResult = lastThreeDigits;
    if (remainingDigits) {
      formattedResult = `,${lastThreeDigits}`;
    }

    let count = 0;
    for (let i = remainingDigits.length - 1; i >= 0; i--) {
      count++;
      formattedResult = remainingDigits.charAt(i) + formattedResult;
      if (count === 2 && i !== 0) {
        formattedResult = `,${formattedResult}`;
        count = 0;
      }
    }

    if (isNegative) {
      formattedResult = `-${formattedResult}`;
    }

    return formattedResult + formattedDecimalPart;
  }, []);

  /**
   * Formats an entire expression with commas for display
   */
  const formatExpressionForDisplay = useCallback(
    (rawExpression) => {
      if (!rawExpression) return "";

      let formattedExpression = "";
      let currentNumber = "";

      for (let i = 0; i < rawExpression.length; i++) {
        const char = rawExpression[i];

        // Check if character is part of a number
        const isPartOfNumber =
          /[\d.]/.test(char) ||
          (char === "-" &&
            (i === 0 || /[+\-x÷%\s(]/.test(rawExpression[i - 1])));

        if (isPartOfNumber) {
          currentNumber += char;
        } else {
          if (currentNumber) {
            formattedExpression += formatNumberWithCommas(currentNumber);
            currentNumber = "";
          }
          formattedExpression += char;
        }
      }

      if (currentNumber) {
        formattedExpression += formatNumberWithCommas(currentNumber);
      }

      return formattedExpression;
    },
    [formatNumberWithCommas],
  );

  /**
   * Adds a calculation to the history
   */
  const addToCalculationHistory = useCallback((expression, result) => {
    const historyItem = {
      id: Date.now(),
      expression,
      result,
    };

    setCalculationHistory((prevHistory) => [historyItem, ...prevHistory]);
  }, []);

  /**
   * Evaluates the current expression and updates result
   */
  const evaluateExpression = useCallback(() => {
    setDisplayExpression("");
    setLastOperationWasEquals(true);

    try {
      if (expression.trim() === "") {
        setResult("");
        return;
      }

      // Prepare expression for evaluation
      const evalExpression = expression
        .replace(/\s+/g, "")
        .replace(/x/g, "*")
        .replace(/÷/g, "/")
        .replace(/%/g, "/100");

      const calculatedValue = eval(evalExpression);

      // Format result with max 5 decimal places
      let resultString;
      if (Number.isInteger(calculatedValue)) {
        resultString = calculatedValue.toString();
      } else {
        const roundedValue = Math.round(calculatedValue * 100000) / 100000;
        resultString = parseFloat(roundedValue.toString()).toString();
      }

      const formattedResult = formatNumberWithCommas(resultString);
      setResult(formattedResult);
      addToCalculationHistory(displayExpression, formattedResult);
    } catch (error) {
      setResult("Error");
      setLastOperationWasEquals(false);
    }
  }, [
    expression,
    displayExpression,
    formatNumberWithCommas,
    addToCalculationHistory,
  ]);

  /**
   * Handles button clicks for numbers, operators, and special functions
   */
  const handleButtonClick = useCallback(
    (value) => {
      setResult("");

      if (value === "C") {
        setExpression("");
        setDisplayExpression("");
        setResult("");
        setLastOperationWasEquals(false);
        return;
      }

      // Handle parentheses insertion
      if (value === "( )") {
        setExpression((prevExpression) => {
          if (prevExpression.length >= 50) return prevExpression;

          if (lastOperationWasEquals && result) {
            setLastOperationWasEquals(false);
            const resultWithoutCommas = result.replace(/,/g, "");
            const newExpression = resultWithoutCommas + "(";
            setDisplayExpression(formatExpressionForDisplay(newExpression));
            return newExpression;
          }

          const openParenthesesCount = (prevExpression.match(/\(/g) || [])
            .length;
          const closeParenthesesCount = (prevExpression.match(/\)/g) || [])
            .length;

          const newExpression =
            openParenthesesCount <= closeParenthesesCount
              ? prevExpression + "("
              : prevExpression + ")";

          setDisplayExpression(formatExpressionForDisplay(newExpression));
          return newExpression;
        });
        return;
      }

      // Handle operator insertion after equals
      if (lastOperationWasEquals && result && OPERATORS.includes(value)) {
        const resultWithoutCommas = result.replace(/,/g, "");
        const newExpression = `${resultWithoutCommas} ${value} `;
        setExpression(newExpression);
        setDisplayExpression(formatExpressionForDisplay(newExpression));
        setLastOperationWasEquals(false);
        return;
      }

      // Handle number/dot insertion after equals
      if (
        lastOperationWasEquals &&
        result &&
        !OPERATORS.includes(value) &&
        value !== "( )"
      ) {
        setExpression(value);
        setDisplayExpression(formatExpressionForDisplay(value));
        setLastOperationWasEquals(false);
        return;
      }

      const formattedValue = OPERATORS.includes(value) ? ` ${value} ` : value;

      setExpression((prevExpression) => {
        const newExpressionLength =
          prevExpression.length + formattedValue.length;
        if (newExpressionLength > 50) return prevExpression;

        const newExpression =
          prevExpression === ""
            ? formattedValue
            : prevExpression + formattedValue;
        setDisplayExpression(formatExpressionForDisplay(newExpression));
        return newExpression;
      });

      setLastOperationWasEquals(false);
    },
    [lastOperationWasEquals, result, formatExpressionForDisplay],
  );

  /**
   * Renders the operation display with colored operators
   */
  const renderOperationDisplay = useMemo(() => {
    if (!displayExpression) return null;

    return (
      <p
        style={{
          color: isDarkTheme ? "white" : "#1a1a1a",
          fontFamily: "Inter, sans-serif",
        }}
        className="operation-display"
      >
        {displayExpression.split("").map((char, index) => {
          const trimmedChar = char.trim();
          return (
            <span
              key={`${char}-${index}`}
              style={{
                color: OPERATORS.includes(trimmedChar)
                  ? isDarkTheme
                    ? "greenyellow"
                    : "gold"
                  : isDarkTheme
                    ? "white"
                    : "#1a1a1a",
              }}
            >
              {char}
            </span>
          );
        })}
      </p>
    );
  }, [displayExpression, isDarkTheme]);

  /**
   * Handles backspace/delete functionality
   */
  const handleDelete = useCallback(() => {
    setExpression((prevExpression) => {
      if (!prevExpression || prevExpression.trim() === "") {
        setDisplayExpression("");
        return "";
      }

      if (prevExpression.endsWith(" ")) {
        const operatorsWithSpaces = [" + ", " - ", " x ", " ÷ ", " % "];
        const lastThreeChars = prevExpression.slice(-3);

        if (operatorsWithSpaces.includes(lastThreeChars)) {
          const newExpression = prevExpression.slice(0, -3);
          setDisplayExpression(formatExpressionForDisplay(newExpression));
          return newExpression;
        } else {
          const newExpression = prevExpression.trimEnd();
          setDisplayExpression(formatExpressionForDisplay(newExpression));
          return newExpression;
        }
      } else {
        const newExpression = prevExpression.slice(0, -1);
        setDisplayExpression(formatExpressionForDisplay(newExpression));
        return newExpression;
      }
    });

    setResult("");
    setLastOperationWasEquals(false);
  }, [formatExpressionForDisplay]);

  /**
   * Toggles the sign of the last number in the expression
   */
  const handleSignToggle = useCallback(() => {
    setExpression((prevExpression) => {
      if (!prevExpression || prevExpression.trim() === "") {
        if (lastOperationWasEquals && result) {
          setLastOperationWasEquals(false);
          const resultWithoutCommas = result.replace(/,/g, "");
          const newExpression = `(-${resultWithoutCommas})`;
          setDisplayExpression(formatExpressionForDisplay(newExpression));
          return newExpression;
        }
        return prevExpression;
      }

      const trimmedExpression = prevExpression.trim();
      let i = trimmedExpression.length - 1;

      while (
        i >= 0 &&
        !["+", "-", "x", "÷", "%", " "].includes(trimmedExpression[i]) &&
        trimmedExpression[i] !== "(" &&
        trimmedExpression[i] !== ")"
      ) {
        i--;
      }

      const beforeNumber = trimmedExpression.substring(0, i + 1);
      const lastNumber = trimmedExpression.substring(i + 1);
      const lastNumberWithoutCommas = lastNumber.replace(/,/g, "");

      let newExpression;

      if (
        lastNumberWithoutCommas.startsWith("(-") &&
        lastNumberWithoutCommas.endsWith(")")
      ) {
        const positiveNumber = lastNumberWithoutCommas.substring(
          2,
          lastNumberWithoutCommas.length - 1,
        );
        newExpression = beforeNumber + positiveNumber;
      } else {
        newExpression = `${beforeNumber}(-${lastNumberWithoutCommas})`;
        if (newExpression.length > 50) return prevExpression;
      }

      setDisplayExpression(formatExpressionForDisplay(newExpression));
      return newExpression;
    });

    setLastOperationWasEquals(false);
  }, [lastOperationWasEquals, result, formatExpressionForDisplay]);

  /**
   * Renders the calculator keyboard buttons
   */
  const renderCalculatorButtons = useMemo(
    () => (
      <div className="keyboarrd">
        {/* Row 1: C, ( ), %, ÷ */}
        <div className="button-row">
          {["C", "( )", "%", "÷"].map((button) => (
            <button
              key={button}
              className="op-buttons"
              style={{
                backgroundColor:
                  button === "÷"
                    ? isDarkTheme
                      ? "#1a1a1a"
                      : "#e0e0e0"
                    : isDarkTheme
                      ? "rgb(57, 57, 57)"
                      : "#d0d0d0",
                color:
                  button === "C"
                    ? "#ff4444"
                    : isDarkTheme
                      ? "white"
                      : "#1a1a1a",
              }}
              onClick={() => handleButtonClick(button)}
            >
              {button === "÷" ? (
                <i className={`fa-solid ${OPERATOR_DISPLAY_MAP[button]}`} />
              ) : (
                button
              )}
            </button>
          ))}
        </div>

        {/* Row 2: 7, 8, 9, x */}
        {[[7, 8, 9, "x"]].map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="button-row">
            {row.map((value) => (
              <button
                key={value}
                className="op-buttons"
                style={{
                  backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                }}
                onClick={() => handleButtonClick(value.toString())}
              >
                {typeof value === "number" ? (
                  value
                ) : (
                  <i className={`fa-solid ${OPERATOR_DISPLAY_MAP[value]}`} />
                )}
              </button>
            ))}
          </div>
        ))}

        {/* Row 3: 4, 5, 6, - */}
        {[[4, 5, 6, "-"]].map((row, rowIndex) => (
          <div key={`row-${rowIndex + 2}`} className="button-row">
            {row.map((value) => (
              <button
                key={value}
                className="op-buttons"
                style={{
                  backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                }}
                onClick={() => handleButtonClick(value.toString())}
              >
                {typeof value === "number" ? (
                  value
                ) : (
                  <i className={`fa-solid ${OPERATOR_DISPLAY_MAP[value]}`} />
                )}
              </button>
            ))}
          </div>
        ))}

        {/* Row 4: 1, 2, 3, + */}
        {[[1, 2, 3, "+"]].map((row, rowIndex) => (
          <div key={`row-${rowIndex + 3}`} className="button-row">
            {row.map((value) => (
              <button
                key={value}
                className="op-buttons"
                style={{
                  backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                }}
                onClick={() => handleButtonClick(value.toString())}
              >
                {typeof value === "number" ? (
                  value
                ) : (
                  <i className={`fa-solid ${OPERATOR_DISPLAY_MAP[value]}`} />
                )}
              </button>
            ))}
          </div>
        ))}

        {/* Row 5: +/-, 0, ., = */}
        <div className="button-row">
          <button
            className="op-buttons"
            style={{
              backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
              color: isDarkTheme ? "white" : "#1a1a1a",
            }}
            onClick={handleSignToggle}
          >
            +/-
          </button>
          <button
            className="op-buttons"
            style={{
              backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
              color: isDarkTheme ? "white" : "#1a1a1a",
            }}
            onClick={() => handleButtonClick("0")}
          >
            0
          </button>
          <button
            className="op-buttons"
            style={{
              backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
              color: isDarkTheme ? "white" : "#1a1a1a",
            }}
            onClick={() => handleButtonClick(".")}
          >
            .
          </button>
          <button
            className="op-buttons"
            style={{
              backgroundColor: "green",
              color: "white",
            }}
            onClick={evaluateExpression}
          >
            =
          </button>
        </div>
      </div>
    ),
    [handleButtonClick, handleSignToggle, evaluateExpression, isDarkTheme],
  );

  /**
   * Renders the calculation history
   */
  const renderHistory = useMemo(
    () => (
      <div className="history">
        {calculationHistory.length === 0 ? (
          <p
            style={{
              color: isDarkTheme ? "gray" : "#666",
              textAlign: "center",
            }}
          >
            No calculations yet
          </p>
        ) : (
          <div className="history-list">
            {calculationHistory.map((item) => (
              <div
                key={item.id}
                className="history-item"
                style={{
                  borderBottom: isDarkTheme
                    ? "1px solid rgb(57, 57, 57)"
                    : "1px solid #ccc",
                }}
              >
                <div className="history-list-items">
                  <p
                    style={{
                      color: isDarkTheme ? "white" : "#1a1a1a",
                      padding: "15px",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "20px",
                    }}
                  >
                    {item.expression} ={" "}
                    <span
                      style={{ color: isDarkTheme ? "greenyellow" : "gold" }}
                    >
                      {item.result}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    [calculationHistory, isDarkTheme],
  );

  return (
    <>
      <div className="brand-container">
        <div className="brand">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "380px",
              padding: "0 10px",
            }}
          >
            <h3
              style={{
                color: isDarkTheme ? "whitesmoke" : "#1a1a1a",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <i className="fa-solid fa-flask"></i> iINTUIT Labs.
            </h3>

            <button
              className="theme-toggle"
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              aria-label={
                isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
              }
              style={{
                background: "none",
                border: "none",
                color: isDarkTheme ? "greenyellow" : "#1a1a1a",
                fontSize: "16px",
                cursor: "pointer",
                padding: "5px 10px",
                borderRadius: "5px",
                transition: "all 0.2s ease",
              }}
            >
              <i
                className={`fa-solid ${isDarkTheme ? "fa-sun" : "fa-moon"}`}
              ></i>
              <span style={{ marginLeft: "5px", fontSize: "12px" }}>
                {isDarkTheme ? "Light" : "Dark"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="calculator-container">
        {/* Display Section */}
        <div className="display">
          <div className="expression-display" style={{ fontSize: "35px" }}>
            {renderOperationDisplay}
          </div>
          <div className="result">
            <p
              key={result}
              className="result-text animate__animated animate__zoomIn"
              style={{
                color: isDarkTheme ? "greenyellow" : "gold",
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

        {/* Calculator Body */}
        <div className="container">
          <div className="divider-span">
            <span
              style={{
                color: isDarkTheme ? "rgb(57, 57, 57)" : "#ccc",
                marginBottom: "0px",
                margin: "0",
                padding: "0",
              }}
            >
              _______________________________________________
            </span>
          </div>

          {/* Toolbar */}
          <div className="container-two">
            <div className="operation-buttons-div">
              <div className="history-button-div">
                <button
                  className="history-button"
                  onClick={() => setShowCalculator(false)}
                  aria-label="View history"
                  style={{
                    color: isDarkTheme ? "greenyellow" : "#1a1a1a",
                  }}
                >
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </button>
              </div>

              <div className="calculator-button-div">
                <button
                  className="calculator-button"
                  onClick={() => setShowCalculator(true)}
                  aria-label="Show calculator"
                  style={{
                    color: isDarkTheme ? "greenyellow" : "#1a1a1a",
                  }}
                >
                  <i className="fa-solid fa-calculator"></i>
                </button>
              </div>

              <div className="delete-btn-div">
                <button
                  className="delete-button"
                  onClick={handleDelete}
                  aria-label="Delete last character"
                  style={{
                    color: isDarkTheme ? "gold" : "#1a1a1a",
                  }}
                >
                  <i className="fa-solid fa-delete-left"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Calculator or History */}
          {showCalculator ? renderCalculatorButtons : renderHistory}
        </div>
      </div>
    </>
  );
}

export default Calculator;
