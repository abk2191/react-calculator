import { useState } from "react";

function App() {
  return (
    <>
      <div className="calculator-container">
        <div className="display"></div>
        <div className="keyboarrd">
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "grey", color: "white" }}
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
            >
              %
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
            >
              /
            </button>
          </div>
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
            >
              7
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
            >
              8
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
            >
              9
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
            >
              X
            </button>
          </div>
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
            >
              4
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
            >
              5
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
            >
              6
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
            >
              -
            </button>
          </div>
          <div className="button-row">
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
            >
              1
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
            >
              2
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#373737", color: "white" }}
            >
              3
            </button>
            <button
              className="op-buttons"
              style={{ backgroundColor: "#1a1a1a", color: "white" }}
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
