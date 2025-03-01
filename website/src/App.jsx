import React from "react";
import Canvas from "./Canvas";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Canvas width={256} height={256} />
      </header>
    </div>
  );
}

export default App;
