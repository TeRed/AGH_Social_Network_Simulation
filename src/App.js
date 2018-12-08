import React, { Component } from "react";
import "./App.css";
import { NavBar } from "./features/navbar/NavBar";
import GraphContainer from "./features/graph/GraphContainer";

class App extends Component {
  render() {
    return (
      <div className="App">
        <NavBar />
        <GraphContainer />
      </div>
    );
  }
}

export default App;
