import React from "react";
import * as tf from "@tensorflow/tfjs";
import { Component } from "react";

async function getModel() {
  const model = await tf.loadLayersModel(
    process.env.PUBLIC_URL + "/model/model.json",
  );

  return model;
}

class Canvas extends Component {
  constructor(props = { width: 512, height: 512 }) {
    super(props);

    this.model = getModel();
    this.width = props.width;
    this.height = props.height;
    this.canvasRef = React.createRef(null);
    this.tableRef = React.createRef(null);
    this.state = {
      isDrawing: false,
      setIsDrawing: false,
      mousePosition: {
        x: 0,
        y: 0,
      },
      setMousePosition: {
        x: 0,
        y: 0,
      },
      truthVals: {
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
        9: false,
      },
    };
  }

  handleMouseDown = (e) => {
    this.setState({ isDrawing: true });
    this.setState({ setIsDrawing: true });
    this.setState({
      setMousePosition: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
    });
    this.setState({
      mousePosition: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
    });
  };

  handleMouseMove = (e) => {
    if (!this.state.isDrawing) return;

    const newPosition = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    const canvas = this.canvasRef.current;
    const context = canvas.getContext("2d", {
      willReadFrequentily: true,
    });

    context.lineCap = "round";
    context.strokeStyle = "white";
    context.lineWidth = 12;

    context.beginPath();
    context.moveTo(this.state.mousePosition.x, this.state.mousePosition.y);
    context.lineTo(newPosition.x, newPosition.y);
    context.stroke();

    this.setState({ setMousePosition: newPosition });
    this.setState({ mousePosition: newPosition });
  };

  handleMouseUp = () => {
    this.setState({ setIsDrawing: false });
    this.setState({ isDrawing: false });
  };

  handleTableUpdate = (vals) => {
    this.setState({ truthVals: vals });

    this.truthVals = vals;

    for (var i = 0; i < 10; i++) {
      if (this.truthVals[i] === true) {
        this.tableRef.current.rows[0].cells[i].children[0].className = "true";
      } else {
        this.tableRef.current.rows[0].cells[i].children[0].className = "false";
      }
    }
  };

  reset() {
    const context = this.canvasRef.current.getContext("2d", {
      willReadFrequentily: true,
    });

    context.clearRect(0, 0, this.width, this.height);
    this.handleTableUpdate({
      0: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
    });

    for (var i = 0; i < 10; i++) {
      this.tableRef.current.rows[0].cells[i].children[0].className = "false";
    }
  }

  handleClick(button) {
    if (button === "reset") {
      this.reset();
    } else if (button === "submit") {
      this.makePredictions(
        this.canvasRef.current
          .getContext("2d", {
            willReadFrequentily: true,
          })
          .getImageData(0, 0, this.width, this.height),
      );
    }
  }

  makePredictions(imgData) {
    this.model.then((m) => {
      var size = 64;
      var numDim = 3;

      // for grayscale input
      // var img = tf.browser
      //   .fromPixels(imgData)
      //   .mean(2)
      //   .toFloat()
      //   .expandDims(0)
      //   .expandDims(-1)
      //   .resizeBilinear([28, 28]);

      // for rgb input
      var img = tf.browser.fromPixels(imgData).resizeBilinear([size, size]);
      img = tf.reshape(img, [1, size, size, numDim]);

      var predictions = m.predict(img).arraySync()[0];
      var newState = {
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
        9: false,
      };
      var maxPrediction = Math.max.apply(Math, predictions);

      for (var i = 0; i < predictions.length; i++) {
        if (predictions[i] - maxPrediction >= -0.1 && predictions[i] !== 0) {
          newState[i] = true;
        }
      }

      console.log(predictions);

      this.handleTableUpdate(newState);
      this.forceUpdate();
    });
  }

  render() {
    var numbers = [];
    for (var i = 0; i < 10; i++) {
      numbers.push(i);
    }

    return (
      <>
        <canvas
          ref={this.canvasRef}
          width={this.width}
          height={this.height}
          style={{ border: "1px solid black" }}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onMouseLeave={this.handleMouseUp}
        />

        <table ref={this.tableRef}>
          <tbody>
            <tr>
              {Object.entries(this.state.truthVals).map(([num, val]) => (
                <td key={num}>
                  <div className={val ? "true" : "false"}>{num}</div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div className="buttons">
          <button className="button" onClick={() => this.handleClick("submit")}>
            Submit
          </button>
          <button className="button" onClick={() => this.handleClick("reset")}>
            Reset
          </button>
        </div>
      </>
    );
  }
}

export default Canvas;
