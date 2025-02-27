import React from "react";
import Canvas from "./Canvas";
import "./App.css";

const drawingCanvas = new Canvas({ width: 512, height: 512 });

function handleClick(button) {
  if (button === "reset") {
  } else if (button === "submit") {
  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Canvas width={512} height={512} />
      </header>
    </div>
  );
}

export default App;
