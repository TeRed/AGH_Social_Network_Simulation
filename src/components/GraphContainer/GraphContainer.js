import React from "react";
import "./GraphContainer.css";
import cytoscape from "cytoscape";
import uniqid from "uniqid";
import { CyUtil } from "../../utils/CyUtil";
import Button from "../Button/Button";
import LiveData from "../LiveData/LiveData";

export default class GraphContainer extends React.Component {
  // cytoscape reference
  CY = null;

  nodesSleep = [];
  nodesDead = [];
  T = 100;

  state = {
    simulationStarted: false,
    diagnosticData: {
      clusteringCoefficient: 0
    }
  };

  startSimulation = () => {
    this.setState({ simulationStarted: true });
    this.CY = cytoscape({
      container: document.getElementById("cy"),
      layout: {
        name: "cose"
      },
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#FC4A1A"
          }
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#F7B733"
          }
        }
      ]
    });

    setTimeout(() => {
      for (let t = 1; t < this.T; t++) {
        setTimeout(() => this.simulate(t), t * 1500);
      }
    }, 0);
  };

  simulate = t => {
    // Tworzymy nowe node'y
    let nodes = Array.apply(null, Array(CyUtil.N(t))).map(() => ({
      id: uniqid()
    }));

    // Dodajemy je do grafu
    this.CY.add(nodes.map(el => ({ group: "nodes", data: { id: el.id } })));

    // Wyliczamy czas zycia nowych node'ów
    nodes.forEach(n => {
      n.deathTime = CyUtil.lifetime() + t;
    });

    // Dla kazdego z nowych node'ów wybieramy sąsiada
    nodes.forEach(n => {
      if (this.nodesSleep.length === 0) {
        //w pierwszej iteracji nie wybieram polaczen
        n.links = [];
      } else {
        // console.log(t);
        // console.log(this.nodesSleep);
        let linkNode = CyUtil.lookForManyLinksNode(this.nodesSleep);
        // console.log(linkNode);
        n.links = [linkNode];
        linkNode.links.push(n); //linki w dwie strony
        this.CY.add({
          group: "edges",
          data: { source: n.id, target: linkNode.id }
        });
      }
    });

    // Usypiamy nowe node'y
    nodes.forEach(n => {
      n.wakeTime = CyUtil.sleeptime() + t;
    });

    // Ze spiacych wybieramy wybudzone node'y
    let nodesAwaken = this.nodesSleep.filter(n => n.wakeTime <= t);
    nodesAwaken.forEach(n => {
      let linkNode = CyUtil.getRandomLink(n);

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

    // Wybieramy martwe node'y
    let newNodesDead = nodesAwaken.filter(n => n.deathTime <= t);
    // Usuwamy martwe node'y ze spiących
    this.nodesSleep = this.nodesSleep.filter(n => !newNodesDead.includes(n));
    // Dodajemy nowe node'y do spiących
    this.nodesSleep = this.nodesSleep.concat(nodes);

    // Wyrzucamy martwe node'y z grafu
    newNodesDead.forEach(n => {
      n.links.forEach(el => {
        el.links = el.links.filter(item => item !== n);
        if (el.links.length === 0) {
          this.CY.remove(this.CY.$("#" + el.id));
        }
      });

      this.CY.remove(this.CY.$("#" + n.id));
    });

    this.nodesDead = this.nodesDead.concat(newNodesDead);

    this.CY.layout({
      name: "cose",
      animate: false,
      componentSpacing: 15
    }).run();

    this.setState({
      diagnosticData: {
        clusteringCoefficient: CyUtil.calculateAverageClustering(t, this.nodesSleep)
      }
    });
  };

  render() {
    const { simulationStarted } = this.state;
    return (
      <>
        <div className={"GraphContainer"} id="cy" />
        {simulationStarted ? (
          <LiveData diagnosticData={this.state.diagnosticData} />
        ) : null}
        {simulationStarted ? null : (
          <Button onClick={this.startSimulation} text={"START"} />
        )}
      </>
    );
  }
}
