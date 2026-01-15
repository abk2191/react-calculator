import { useState } from "react";

function App() {
  const [opvalue, setOpvalue] = useState("");

  function displayOperations(value) {
    setOpvalue((prevValue) => {
      // If prevValue is null or empty, start with the value
      // if (prevValue === null || prevValue === "") {
      //   return value;
      // }
      // Otherwise, concatenate the new value
      return prevValue + value;
    });
  }
  return (
    <>
      <div className="calculator-container">
        <div className="display">
          <p style={{ color: "white" }} className="operation-display">
            {opvalue}
          </p>
        </div>
        <div className="keyboarrd">
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "grey", color: "white" }}
              onClick={() => displayOperations("C")}
            >
              C
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "grey", color: "white" }}
            >
              ()
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "grey", color: "white" }}
              onClick={() => displayOperations("%")}
            >
              %
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("/")}
            >
              /
            </button>
          </div>
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
              onClick={() => displayOperations("7")}
            >
              7
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
              onClick={() => displayOperations("8")}
            >
              8
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
              onClick={() => displayOperations("9")}
            >
              9
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
              onClick={() => displayOperations("*")}
            >
              X
            </button>
          </div>
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
              onClick={() => displayOperations("4")}
            >
              4
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
              onClick={() => displayOperations("5")}
            >
              5
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
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
              style={{ backgroundColor: "#373737", color: "white" }}
              onClick={() => displayOperations("1")}
            >
              1
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
              onClick={() => displayOperations("2")}
            >
              2
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
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
              style={{ backgroundColor: "#373737", color: "white" }}
            >
              +/-
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
              onClick={() => displayOperations("0")}
            >
              0
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
            >
              .
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "green", color: "white" }}
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
