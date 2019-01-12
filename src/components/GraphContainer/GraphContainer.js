import React from "react";
import "./GraphContainer.css";
import cytoscape from "cytoscape";
import uniqid from "uniqid";
import { CyUtil } from "../../utils/CyUtil";
import Button from "../Button/Button";
import LiveData from "../LiveData/LiveData";
import Plotly from "plotly.js-dist";

export default class GraphContainer extends React.Component {
  // cytoscape reference
  CY = null;
  nodesSleep = [];
  T = 50;
  timeouts = [];

  state = {
    simulationRunning: false,
    diagnosticData: {
      atom: {
        iteration: {
          value: 0,
          fixed: 0
        },
        clusteringCoefficient: 0,
        graphDensity: 0,
        averageDegree: 0,
        totalDegree: {
          value: 0,
          fixed: 0
        },
      },
      ccPlotData: null,
      densityPlotData: null
    }
  };

  startSimulation = () => {
    if (this.CY !== null) this.CY.destroy();
    this.setState({
      simulationRunning: true,
      diagnosticData: {
        atom: {
          iteration: {
            value: 0,
            fixed: 0
          },
          clusteringCoefficient: 0,
          graphDensity: 0,
          averageDegree: 0,
          totalDegree: {
            value: 0,
            fixed: 0
          },
        },
        ccPlotData: null,
        densityPlotData: null
      }
    });
    this.CY = cytoscape({
      container: document.getElementById("cy"),
      layout: {
        name: "cose",
        padding: 60,
        gravity: 12,
      },
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#F7B733"
          }
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#FC4A1A"
          }
        }
      ]
    });

    for (let t = 1; t < this.T; t++) {
      this.timeouts.push(
        setTimeout(() => {
          if (this.state.simulationRunning) this.simulate(t);
        }, t * 1000)
      );
    }
  };

  stopSimulation = () => {
    this.setState({ simulationRunning: false });
    this.nodesSleep = [];
    for (const el of this.timeouts) {
      clearTimeout(el);
    }
  };

  simulate = t => {
    // Faza I

    // Ze spiacych wybieramy wybudzone node'y
    let nodesAwaken = this.nodesSleep.filter(n => n.wakeTime <= t);

    // Wybieramy martwe node'y
    let newNodesDead = nodesAwaken.filter(n => n.deathTime <= t);

    // Wyrzucamy martwe node'y z grafu
    newNodesDead.forEach(n => {
      n.links.forEach(el => {
        el.links = el.links.filter(item => item !== n);

        if(el.links.length === 0) {
          el.deathTime = t;
          el.wakeTime = t + 1;
        }
      });
      this.CY.remove(this.CY.$("#" + n.id));
    });

    // Usuwamy martwe node'y ze spiących
    this.nodesSleep = this.nodesSleep.filter(n => !newNodesDead.includes(n));

    // Ze spiacych wybieramy node wybudzone node'y
    nodesAwaken = this.nodesSleep.filter(n => n.wakeTime <= t);

    nodesAwaken.forEach(n => {
      let linkNode = CyUtil.getRandomLink(n);
      if(Math.floor(Math.random() * 90) === 1) linkNode = CyUtil.lookForManyLinksNode(this.nodesSleep);

      if (linkNode !== n && linkNode !== undefined) {
        n.links.push(linkNode);
        linkNode.links.push(n);
        this.CY.add({
          group: "edges",
          data: { source: n.id, target: linkNode.id }
        });
      }

      n.wakeTime = CyUtil.sleeptime() + t;
    });

    // Faza II

    // Tworzymy nowe node'y
    let nodes = Array.apply(null, Array(CyUtil.N(t))).map(() => ({
      id: uniqid()
    }));

    // Dodajemy je do grafu
    this.CY.add(nodes.map(el => ({ group: "nodes", data: { id: el.id } })));

    // Dla kazdego z nowych node'ów wybieramy sąsiada
    nodes.forEach(n => {
      if (this.nodesSleep.length === 0) {
        //w pierwszej iteracji nie wybieram polaczen
        n.links = [];
      } else {
        let linkNode = CyUtil.lookForManyLinksNode(this.nodesSleep);
        n.links = [linkNode];
        linkNode.links.push(n); //linki w dwie strony
        this.CY.add({
          group: "edges",
          data: { source: n.id, target: linkNode.id }
        });
      }

      // Wyliczamy czas zycia nowych node'ów
      const deathTime = CyUtil.lifetime() + t;
      n.deathTime = deathTime > 8 ? deathTime : 8;

      // Wyliczamy czas snu node'ów
      n.wakeTime = CyUtil.sleeptime() + t;
    });

    // Dodajemy nowe node'y do spiących
    this.nodesSleep = this.nodesSleep.concat(nodes);
    
    this.CY.layout({
      name: "cose",
      animate: false,
      padding: 60,
      componentSpacing: 15,
      nestingFactor: 1.2,
      gravity: 12,
      weaver: true
    }).run();

    this.setState((state) => {
      const graphDensity = this.CY.edges().length / this.CY.nodes().length;
      
      return {
        diagnosticData: {
          atom: {
            iteration: {
              value: t
            },
            clusteringCoefficient: CyUtil.calculateAverageClustering(
              t,
              this.nodesSleep
            ),
            graphDensity,
            averageDegree:
              this.CY.nodes().totalDegree(true) / this.CY.nodes().length,
            totalDegree: {
              value: this.CY.nodes().totalDegree(true)
            }
          },
          ccPlotData: CyUtil.nodesEdgesNumberPlotData(this.nodesSleep),
          densityPlotData: CyUtil.densityPlotData(state.diagnosticData.densityPlotData, graphDensity)
        }
      };
    });

    Plotly.newPlot('cc-plot', [this.state.diagnosticData.ccPlotData], {
      width: 300,
      height: 350,
      margin: 10,
      paper: '#FFFFFF80',
      xaxis: {
        title: 'Node degree',
      },
      yaxis: {
        title: 'Number of nodes'
      },
      title: 'Node degree distribution'
    });

    Plotly.newPlot('density-plot', [this.state.diagnosticData.densityPlotData], {
      width: 300,
      height: 350,
      margin: 10,
      paper: '#FFFFFF80',
      xaxis: {
        title: 'Iteration',
      },
      yaxis: {
        title: 'Graph density'
      },
      title: 'Graph density in time'
    });

  };

  render() {
    const { simulationRunning } = this.state;
    return (
      <>
        <div className={"GraphContainer"} id="cy" />
        {simulationRunning ? (
          <LiveData diagnosticData={this.state.diagnosticData.atom} />
        ) : null}
        {simulationRunning ? null : (
          <Button
            top={"50%"}
            left={"50%"}
            backgroundColor={"#f94b29"}
            onClick={this.startSimulation}
            text={"START"}
          />
        )}
        {simulationRunning ? (
          <Button
            top={108}
            left={60}
            backgroundColor={"#50bcac"}
            onClick={this.stopSimulation}
            text={"STOP"}
          />
        ) : null}
      </>
    );
  }
}
