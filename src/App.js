import React, { Component } from "react";
import "./App.css";
import { NavBar } from "./components/NavBar/NavBar";
import GraphContainer from "./components/GraphContainer/GraphContainer";

class App extends Component {
  render() {
    return (
      <div className="App">
        <GraphContainer />
        <NavBar />
      </div>
    );
  }
}

export default App;
