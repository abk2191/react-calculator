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
  const [isPercentageCalc, setIsPercentageCalc] = useState(false);
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

  // Percentage Calculator States
  const [activePercTab, setActivePercTab] = useState("standard");

  // Standard Tab
  const [standardPercent, setStandardPercent] = useState("");
  const [standardOf, setStandardOf] = useState("");
  const [standardResult, setStandardResult] = useState("");
  const [standardSteps, setStandardSteps] = useState("");

  // Common Phrases Tab
  const [commonWhatPercent, setCommonWhatPercent] = useState("");
  const [commonWhatOf, setCommonWhatOf] = useState("");
  const [commonWhatResult, setCommonWhatResult] = useState("");
  const [commonWhatSteps, setCommonWhatSteps] = useState("");

  const [commonIsWhatIs, setCommonIsWhatIs] = useState("");
  const [commonIsWhatOf, setCommonIsWhatOf] = useState("");
  const [commonIsWhatResult, setCommonIsWhatResult] = useState("");
  const [commonIsWhatSteps, setCommonIsWhatSteps] = useState("");

  const [commonIsOfWhatIs, setCommonIsOfWhatIs] = useState("");
  const [commonIsOfWhatPercent, setCommonIsOfWhatPercent] = useState("");
  const [commonIsOfWhatResult, setCommonIsOfWhatResult] = useState("");
  const [commonIsOfWhatSteps, setCommonIsOfWhatSteps] = useState("");

  // Difference Tab
  const [diffValue1, setDiffValue1] = useState("");
  const [diffValue2, setDiffValue2] = useState("");
  const [diffResult, setDiffResult] = useState("");
  const [diffSteps, setDiffSteps] = useState("");

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
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const seconds = Math.floor(timeDiff / 1000);

    const formatNumber = (num) => {
      return num.toLocaleString();
    };

    const result =
      `${years} Years, ${months} Months, ${days} Days\n\n` +
      `${formatNumber(hours)} Hours\n` +
      `${formatNumber(minutes)} Minutes\n` +
      `${formatNumber(seconds)} Seconds`;

    setAgeResult(result);
  }

  // Percentage Calculator Functions
  const calculateStandardPercentage = () => {
    const percent = parseFloat(standardPercent);
    const of = parseFloat(standardOf);
    if (isNaN(percent) || isNaN(of)) {
      setStandardResult("Please enter valid numbers");
      setStandardSteps("");
      return;
    }
    const calculated = (percent / 100) * of;
    setStandardResult(`${calculated}`);
    setStandardSteps(`${percent}% × ${of} = ${calculated}`);
  };

  const clearStandard = () => {
    setStandardPercent("");
    setStandardOf("");
    setStandardResult("");
    setStandardSteps("");
  };

  const calculateCommonWhat = () => {
    const percent = parseFloat(commonWhatPercent);
    const of = parseFloat(commonWhatOf);
    if (isNaN(percent) || isNaN(of)) {
      setCommonWhatResult("Please enter valid numbers");
      setCommonWhatSteps("");
      return;
    }
    const calculated = (percent / 100) * of;
    setCommonWhatResult(`${calculated}`);
    setCommonWhatSteps(`${percent}% × ${of} = ${calculated}`);
  };

  const calculateCommonIsWhat = () => {
    const isVal = parseFloat(commonIsWhatIs);
    const ofVal = parseFloat(commonIsWhatOf);
    if (isNaN(isVal) || isNaN(ofVal) || ofVal === 0) {
      setCommonIsWhatResult("Please enter valid numbers");
      setCommonIsWhatSteps("");
      return;
    }
    const calculated = (isVal / ofVal) * 100;
    setCommonIsWhatResult(`${calculated}%`);
    setCommonIsWhatSteps(`${isVal} / ${ofVal} × 100 = ${calculated}%`);
  };

  const calculateCommonIsOfWhat = () => {
    const isVal = parseFloat(commonIsOfWhatIs);
    const percent = parseFloat(commonIsOfWhatPercent);
    if (isNaN(isVal) || isNaN(percent) || percent === 0) {
      setCommonIsOfWhatResult("Please enter valid numbers");
      setCommonIsOfWhatSteps("");
      return;
    }
    const calculated = (isVal / percent) * 100;
    setCommonIsOfWhatResult(`${calculated}`);
    setCommonIsOfWhatSteps(`${isVal} / ${percent}% × 100 = ${calculated}`);
  };

  const calculateDifference = () => {
    const v1 = parseFloat(diffValue1);
    const v2 = parseFloat(diffValue2);
    if (isNaN(v1) || isNaN(v2)) {
      setDiffResult("Please enter valid numbers");
      setDiffSteps("");
      return;
    }
    const average = (v1 + v2) / 2;
    const difference = ((Math.abs(v1 - v2) / average) * 100).toFixed(2);
    setDiffResult(`${difference}%`);
    setDiffSteps(
      `|${v1} - ${v2}| / ((${v1} + ${v2})/2) × 100 = ${difference}%`,
    );
  };

  const clearDifference = () => {
    setDiffValue1("");
    setDiffValue2("");
    setDiffResult("");
    setDiffSteps("");
  };

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

  const renderPercentageCalculator = () => (
    <div className="percentage-calculator" style={{ padding: "20px" }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "5px",
          marginBottom: "25px",
          borderBottom: isDarkTheme ? "1px solid #333" : "1px solid #ddd",
          paddingBottom: "0px",
        }}
      >
        {[
          { id: "standard", label: "Percentage calculator" },
          { id: "common", label: "Common phrases" },
          { id: "difference", label: "Percentage difference" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePercTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              padding: "12px 20px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activePercTab === tab.id ? "600" : "400",
              color: isDarkTheme
                ? activePercTab === tab.id
                  ? "greenyellow"
                  : "#aaa"
                : activePercTab === tab.id
                  ? "#1a1a1a"
                  : "#666",
              borderBottom:
                activePercTab === tab.id
                  ? `2px solid ${isDarkTheme ? "greenyellow" : "#1a1a1a"}`
                  : "none",
              textTransform: "capitalize",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Standard Tab */}
      {activePercTab === "standard" && (
        <div>
          <div
            style={{
              backgroundColor: isDarkTheme ? "#1a1a1a" : "#f5f5f5",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <div style={{ marginBottom: "15px" }}>
              <input
                type="number"
                placeholder="%"
                value={standardPercent}
                onChange={(e) => setStandardPercent(e.target.value)}
                style={{
                  width: "90%",
                  padding: "12px",
                  backgroundColor: isDarkTheme ? "#2a2a2a" : "white",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: isDarkTheme ? "1px solid #444" : "1px solid #ccc",
                  borderRadius: "5px",
                  fontSize: "16px",
                  marginBottom: "10px",
                }}
              />
              <input
                type="number"
                placeholder="of"
                value={standardOf}
                onChange={(e) => setStandardOf(e.target.value)}
                style={{
                  width: "90%",
                  padding: "12px",
                  backgroundColor: isDarkTheme ? "#2a2a2a" : "white",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: isDarkTheme ? "1px solid #444" : "1px solid #ccc",
                  borderRadius: "5px",
                  fontSize: "16px",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={calculateStandardPercentage}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Calculate
              </button>
              <button
                onClick={clearStandard}
                style={{
                  padding: "10px 20px",
                  backgroundColor: isDarkTheme ? "#444" : "#ddd",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          </div>
          {standardResult && (
            <div
              style={{
                padding: "15px",
                backgroundColor: isDarkTheme ? "#1a1a1a" : "#f5f5f5",
                borderRadius: "10px",
              }}
            >
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: isDarkTheme ? "greenyellow" : "gold",
                  margin: "0 0 10px 0",
                }}
              >
                Result: {standardResult}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: isDarkTheme ? "#aaa" : "#555",
                  margin: 0,
                }}
              >
                {standardSteps}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Common Phrases Tab */}
      {activePercTab === "common" && (
        <div>
          {/* what is % of */}
          <div
            style={{
              backgroundColor: isDarkTheme ? "#1a1a1a" : "#f5f5f5",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: isDarkTheme ? "white" : "#1a1a1a" }}>
                what is
              </span>
              <input
                type="number"
                placeholder="%"
                value={commonWhatPercent}
                onChange={(e) => setCommonWhatPercent(e.target.value)}
                style={{
                  width: "80px",
                  padding: "8px",
                  backgroundColor: isDarkTheme ? "#2a2a2a" : "white",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: isDarkTheme ? "1px solid #444" : "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
              <span style={{ color: isDarkTheme ? "white" : "#1a1a1a" }}>
                % of
              </span>
              <input
                type="number"
                placeholder="number"
                value={commonWhatOf}
                onChange={(e) => setCommonWhatOf(e.target.value)}
                style={{
                  width: "100px",
                  padding: "8px",
                  backgroundColor: isDarkTheme ? "#2a2a2a" : "white",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: isDarkTheme ? "1px solid #444" : "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
              <button
                onClick={calculateCommonWhat}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Calculate
              </button>
            </div>
            {commonWhatResult && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  backgroundColor: isDarkTheme ? "#0a0a0a" : "#e8e8e8",
                  borderRadius: "8px",
                }}
              >
                <p style={{ margin: 0, color: isDarkTheme ? "#ddd" : "#333" }}>
                  {commonWhatSteps}
                </p>
              </div>
            )}
          </div>

          {/* is what % of */}
          <div
            style={{
              backgroundColor: isDarkTheme ? "#1a1a1a" : "#f5f5f5",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="number"
                placeholder="number"
                value={commonIsWhatIs}
                onChange={(e) => setCommonIsWhatIs(e.target.value)}
                style={{
                  width: "100px",
                  padding: "8px",
                  backgroundColor: isDarkTheme ? "#2a2a2a" : "white",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: isDarkTheme ? "1px solid #444" : "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
              <span style={{ color: isDarkTheme ? "white" : "#1a1a1a" }}>
                is what % of
              </span>
              <input
                type="number"
                placeholder="number"
                value={commonIsWhatOf}
                onChange={(e) => setCommonIsWhatOf(e.target.value)}
                style={{
                  width: "100px",
                  padding: "8px",
                  backgroundColor: isDarkTheme ? "#2a2a2a" : "white",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: isDarkTheme ? "1px solid #444" : "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
              <button
                onClick={calculateCommonIsWhat}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Calculate
              </button>
            </div>
            {commonIsWhatResult && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  backgroundColor: isDarkTheme ? "#0a0a0a" : "#e8e8e8",
                  borderRadius: "8px",
                }}
              >
                <p style={{ margin: 0, color: isDarkTheme ? "#ddd" : "#333" }}>
                  {commonIsWhatSteps}
                </p>
              </div>
            )}
          </div>

          {/* is % of what */}
          <div
            style={{
              backgroundColor: isDarkTheme ? "#1a1a1a" : "#f5f5f5",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="number"
                placeholder="number"
                value={commonIsOfWhatIs}
                onChange={(e) => setCommonIsOfWhatIs(e.target.value)}
                style={{
                  width: "100px",
                  padding: "8px",
                  backgroundColor: isDarkTheme ? "#2a2a2a" : "white",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: isDarkTheme ? "1px solid #444" : "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
              <span style={{ color: isDarkTheme ? "white" : "#1a1a1a" }}>
                is
              </span>
              <input
                type="number"
                placeholder="%"
                value={commonIsOfWhatPercent}
                onChange={(e) => setCommonIsOfWhatPercent(e.target.value)}
                style={{
                  width: "80px",
                  padding: "8px",
                  backgroundColor: isDarkTheme ? "#2a2a2a" : "white",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: isDarkTheme ? "1px solid #444" : "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
              <span style={{ color: isDarkTheme ? "white" : "#1a1a1a" }}>
                % of what
              </span>
              <button
                onClick={calculateCommonIsOfWhat}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Calculate
              </button>
            </div>
            {commonIsOfWhatResult && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  backgroundColor: isDarkTheme ? "#0a0a0a" : "#e8e8e8",
                  borderRadius: "8px",
                }}
              >
                <p style={{ margin: 0, color: isDarkTheme ? "#ddd" : "#333" }}>
                  {commonIsOfWhatSteps}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Difference Tab */}
      {activePercTab === "difference" && (
        <div>
          <div
            style={{
              backgroundColor: isDarkTheme ? "#1a1a1a" : "#f5f5f5",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <div style={{ marginBottom: "15px" }}>
              <input
                type="number"
                placeholder="Value 1"
                value={diffValue1}
                onChange={(e) => setDiffValue1(e.target.value)}
                style={{
                  width: "90%",
                  padding: "12px",
                  backgroundColor: isDarkTheme ? "#2a2a2a" : "white",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: isDarkTheme ? "1px solid #444" : "1px solid #ccc",
                  borderRadius: "5px",
                  fontSize: "16px",
                  marginBottom: "10px",
                }}
              />
              <input
                type="number"
                placeholder="Value 2"
                value={diffValue2}
                onChange={(e) => setDiffValue2(e.target.value)}
                style={{
                  width: "90%",
                  padding: "12px",
                  backgroundColor: isDarkTheme ? "#2a2a2a" : "white",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: isDarkTheme ? "1px solid #444" : "1px solid #ccc",
                  borderRadius: "5px",
                  fontSize: "16px",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={calculateDifference}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Calculate
              </button>
              <button
                onClick={clearDifference}
                style={{
                  padding: "10px 20px",
                  backgroundColor: isDarkTheme ? "#444" : "#ddd",
                  color: isDarkTheme ? "white" : "#1a1a1a",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          </div>
          {diffResult && (
            <div
              style={{
                padding: "15px",
                backgroundColor: isDarkTheme ? "#1a1a1a" : "#f5f5f5",
                borderRadius: "10px",
              }}
            >
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: isDarkTheme ? "greenyellow" : "gold",
                  margin: "0 0 10px 0",
                }}
              >
                Result: {diffResult}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: isDarkTheme ? "#aaa" : "#555",
                  margin: 0,
                }}
              >
                {diffSteps}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
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
                setIsPercentageCalc(false);
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
                setIsPercentageCalc(false);
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
              onClick={() => {
                setIsArithMatic(false);
                setIsAgeCalc(false);
                setIsPercentageCalc(true);
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
              Percentage Calculator
            </p>
          </div>
        )}
      </div>

      <div className="calculator-container">
        <div className="display">
          <div className="expression-display" style={{ fontSize: "35px" }}>
            {isArithmatic && renderOperationDisplay}
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
                    fontSize: "13px",
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

        {isPercentageCalc && renderPercentageCalculator()}
      </div>
    </>
  );
}

export default Calculator;
