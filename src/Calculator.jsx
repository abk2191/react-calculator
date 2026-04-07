import React, { useState, useEffect, useCallback, useMemo } from "react";

const OPERATORS = ["%", "÷", "x", "-", "+"];
const OPERATOR_DISPLAY_MAP = {
  "÷": "fa-divide",
  x: "fa-xmark",
  "-": "fa-minus",
  "+": "fa-plus",
};

function Calculator() {
  const [dob, setDob] = useState({ month: "Jan", day: 1, year: 2000 });
  const [selectedDate, setSelectedDate] = useState({
    month: "Jan",
    day: 1,
    year: new Date().getFullYear(),
  });
  const [ageResult, setAgeResult] = useState("");
  const [isArithmatic, setIsArithMatic] = useState(true);
  const [isAgeCalc, setIsAgeCalc] = useState(false);
  const [modeactive, setModeactive] = useState(false);
  const [expression, setExpression] = useState("");
  const [displayExpression, setDisplayExpression] = useState("");
  const [result, setResult] = useState("");
  const [lastOperationWasEquals, setLastOperationWasEquals] = useState(false);
  const [showCalculator, setShowCalculator] = useState(true);
  const [calculationHistory, setCalculationHistory] = useState(() => {
    const savedHistory = localStorage.getItem("calculator_history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem("calculator_theme");
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  function toggleModeMenu() {
    setModeactive((prev) => !prev);
  }

  function calculateAge() {
    const getMonthNumber = (monthName) => {
      const months = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };
      return months[monthName];
    };

    const birthDate = new Date(dob.year, getMonthNumber(dob.month), dob.day);
    const targetDate = new Date(
      selectedDate.year,
      getMonthNumber(selectedDate.month),
      selectedDate.day,
    );

    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) {
      setAgeResult("Please enter valid dates");
      return;
    }

    if (birthDate > targetDate) {
      setAgeResult("Date of birth cannot be after the selected date");
      return;
    }

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        0,
      );
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const timeDiff = targetDate - birthDate;
    const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const seconds = Math.floor(timeDiff / 1000);

    const result =
      `YOU ARE: ${years} years, ${months} months, ${days} days\n` +
      `| ${totalDays} days, ${weeks} weeks, ${remainingDays} days\n` +
      `| ${hours} hours, ${minutes} minutes, ${seconds} seconds | Old.`;

    setAgeResult(result);
  }

  useEffect(() => {
    localStorage.setItem(
      "calculator_history",
      JSON.stringify(calculationHistory),
    );
  }, [calculationHistory]);

  useEffect(() => {
    localStorage.setItem("calculator_theme", JSON.stringify(isDarkTheme));
    if (isDarkTheme) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [isDarkTheme]);

  const formatNumberWithCommas = useCallback((numberString) => {
    if (!numberString) return "";
    const cleanNumberString = numberString.replace(/,/g, "");
    const [integerPart, decimalPart] = cleanNumberString.split(".");
    let processedIntegerPart = integerPart;
    const formattedDecimalPart = decimalPart ? `.${decimalPart}` : "";
    let isNegative = false;
    if (processedIntegerPart.startsWith("-")) {
      isNegative = true;
      processedIntegerPart = processedIntegerPart.substring(1);
    }
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

  const formatExpressionForDisplay = useCallback(
    (rawExpression) => {
      if (!rawExpression) return "";
      let formattedExpression = "";
      let currentNumber = "";
      for (let i = 0; i < rawExpression.length; i++) {
        const char = rawExpression[i];
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

  const addToCalculationHistory = useCallback((expression, result) => {
    const historyItem = {
      id: Date.now(),
      expression,
      result,
    };
    setCalculationHistory((prevHistory) => [historyItem, ...prevHistory]);
  }, []);

  const evaluateExpression = useCallback(() => {
    setDisplayExpression("");
    setLastOperationWasEquals(true);
    try {
      if (expression.trim() === "") {
        setResult("");
        return;
      }
      const evalExpression = expression
        .replace(/\s+/g, "")
        .replace(/x/g, "*")
        .replace(/÷/g, "/")
        .replace(/%/g, "/100");
      const calculatedValue = eval(evalExpression);
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
      if (lastOperationWasEquals && result && OPERATORS.includes(value)) {
        const resultWithoutCommas = result.replace(/,/g, "");
        const newExpression = `${resultWithoutCommas} ${value} `;
        setExpression(newExpression);
        setDisplayExpression(formatExpressionForDisplay(newExpression));
        setLastOperationWasEquals(false);
        return;
      }
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

  const renderCalculatorButtons = useMemo(
    () => (
      <div className="keyboarrd">
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
              className={`mode-button ${isDarkTheme ? "dark-theme" : "light-theme"}`}
              onClick={() => toggleModeMenu()}
              style={{
                backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
                color: isDarkTheme ? "white" : "#1a1a1a",
                border: isDarkTheme ? "2px solid gray" : "2px solid #999",
              }}
            >
              Mode
            </button>

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

        {modeactive && (
          <div
            className="mode-menu"
            style={{
              color: isDarkTheme ? "white" : "#1a1a1a",
              border: isDarkTheme ? "1px solid #424242" : "1px solid #ccc",
              backgroundColor: isDarkTheme ? "black" : "white",
              boxShadow: isDarkTheme ? "none" : "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <p
              onClick={() => {
                setIsArithMatic(true);
                setModeactive(false);
                setIsAgeCalc(false);
              }}
              style={{
                cursor: "pointer",
                margin: "10px 0",
                padding: "5px 10px",
                borderRadius: "4px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkTheme
                  ? "#333"
                  : "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Arithmatic Calculator
            </p>
            <hr style={{ borderColor: isDarkTheme ? "#424242" : "#ccc" }} />
            <p
              onClick={() => {
                setIsArithMatic(false);
                setIsAgeCalc(true);
                setModeactive(false);
              }}
              style={{
                cursor: "pointer",
                margin: "10px 0",
                padding: "5px 10px",
                borderRadius: "4px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkTheme
                  ? "#333"
                  : "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Age Calculator
            </p>
            <hr style={{ borderColor: isDarkTheme ? "#424242" : "#ccc" }} />
            <p
              style={{
                cursor: "pointer",
                margin: "10px 0",
                padding: "5px 10px",
                borderRadius: "4px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkTheme
                  ? "#333"
                  : "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Percentage Calculator
            </p>
          </div>
        )}
      </div>

      <div className="calculator-container">
        <div className="display">
          <div className="expression-display" style={{ fontSize: "35px" }}>
            {renderOperationDisplay}
          </div>
          {isArithmatic && (
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
          )}
        </div>

        {isArithmatic && (
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

            {showCalculator ? renderCalculatorButtons : renderHistory}
          </div>
        )}

        {isAgeCalc && (
          <div className="age-calculator">
            <div className="age-calc-cont">
              <h3
                style={{
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                ENTER DATE OF BIRTH
              </h3>
              <div className="date-selector">
                <select
                  className="month-select"
                  value={dob.month}
                  onChange={(e) => setDob({ ...dob, month: e.target.value })}
                  style={{
                    backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
                    color: isDarkTheme ? "white" : "#1a1a1a",
                    border: isDarkTheme ? "1px solid gray" : "1px solid #999",
                    borderRadius: "5px",
                    padding: "8px",
                    cursor: "pointer",
                  }}
                >
                  <option>Jan</option>
                  <option>Feb</option>
                  <option>Mar</option>
                  <option>Apr</option>
                  <option>May</option>
                  <option>Jun</option>
                  <option>Jul</option>
                  <option>Aug</option>
                  <option>Sep</option>
                  <option>Oct</option>
                  <option>Nov</option>
                  <option>Dec</option>
                </select>

                <select
                  className="date-select"
                  value={dob.day}
                  onChange={(e) =>
                    setDob({ ...dob, day: parseInt(e.target.value) })
                  }
                  style={{
                    backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
                    color: isDarkTheme ? "white" : "#1a1a1a",
                    border: isDarkTheme ? "1px solid gray" : "1px solid #999",
                    borderRadius: "5px",
                    padding: "8px",
                    cursor: "pointer",
                  }}
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1}>{i + 1}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Enter Year"
                  className="year-select"
                  value={dob.year}
                  onChange={(e) =>
                    setDob({ ...dob, year: parseInt(e.target.value) || "" })
                  }
                  style={{
                    backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
                    color: isDarkTheme ? "white" : "#1a1a1a",
                    border: isDarkTheme ? "1px solid gray" : "1px solid #999",
                    borderRadius: "5px",
                    padding: "8px",
                    outline: "none",
                  }}
                />
              </div>

              <h3
                style={{
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                SELECT A DATE
              </h3>

              <div className="date-selector">
                <select
                  className="month-select"
                  value={selectedDate.month}
                  onChange={(e) =>
                    setSelectedDate({ ...selectedDate, month: e.target.value })
                  }
                  style={{
                    backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
                    color: isDarkTheme ? "white" : "#1a1a1a",
                    border: isDarkTheme ? "1px solid gray" : "1px solid #999",
                    borderRadius: "5px",
                    padding: "8px",
                    cursor: "pointer",
                  }}
                >
                  <option>Jan</option>
                  <option>Feb</option>
                  <option>Mar</option>
                  <option>Apr</option>
                  <option>May</option>
                  <option>Jun</option>
                  <option>Jul</option>
                  <option>Aug</option>
                  <option>Sep</option>
                  <option>Oct</option>
                  <option>Nov</option>
                  <option>Dec</option>
                </select>

                <select
                  className="date-select"
                  value={selectedDate.day}
                  onChange={(e) =>
                    setSelectedDate({
                      ...selectedDate,
                      day: parseInt(e.target.value),
                    })
                  }
                  style={{
                    backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
                    color: isDarkTheme ? "white" : "#1a1a1a",
                    border: isDarkTheme ? "1px solid gray" : "1px solid #999",
                    borderRadius: "5px",
                    padding: "8px",
                    cursor: "pointer",
                  }}
                >
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1}>{i + 1}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Enter Year"
                  className="year-select"
                  value={selectedDate.year}
                  onChange={(e) =>
                    setSelectedDate({
                      ...selectedDate,
                      year: parseInt(e.target.value) || "",
                    })
                  }
                  style={{
                    backgroundColor: isDarkTheme ? "#1a1a1a" : "#e0e0e0",
                    color: isDarkTheme ? "white" : "#1a1a1a",
                    border: isDarkTheme ? "1px solid gray" : "1px solid #999",
                    borderRadius: "5px",
                    padding: "8px",
                    outline: "none",
                  }}
                />
              </div>

              <div className="calculate-button-div">
                <button
                  className="calculate-button"
                  onClick={() => calculateAge()}
                  style={{
                    backgroundColor: isDarkTheme ? "#4CAF50" : "#45a049",
                    color: "white",
                    border: "none",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  CALCULATE
                </button>
              </div>

              <div className="show-age">
                <p
                  className="age-result"
                  style={{
                    color: isDarkTheme ? "greenyellow" : "#e67e22",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    fontWeight: "bold",
                    whiteSpace: "pre-line",
                    textAlign: "center",
                    padding: "10px",

                    borderRadius: "10px",
                    lineHeight: "1.6",
                  }}
                >
                  {ageResult}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Calculator;
