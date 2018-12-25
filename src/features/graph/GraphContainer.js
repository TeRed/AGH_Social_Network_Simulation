import React from "react";
import "./GraphContainer.css";
import cytoscape from "cytoscape";
import uniqid from "uniqid";
import { CyUtil } from "../utils/CyUtil";

export default class GraphContainer extends React.Component {
  nodesSleep = [];
  nodesDead = [];
  T = 20;

  nodesAll = [];
  edgesAll = [];

  render() {
    let cyStyle = {
      height: "100vh",
      width: "100%"
    };
    return <div style={cyStyle} id="graph" />;
  }

  componentDidMount() {
    cytoscape({
      container: document.getElementById("graph"),
      elements: this.simulate(),
      layout: {
        name: "cose"
      }
    });
  }

  simulate = () => {
    for (let t = 1; t < this.T; t++) {
      // punkt 1
      // Oni mają do tego funkcje ale ona zwraca strasznie duze liczby
      let nodes = Array.apply(null, Array(CyUtil.N(t))).map(() => ({
        id: uniqid()
      }));

      // punkt 2
      nodes.forEach(n => {
        n.death_time = CyUtil.lifetime() + t;
      });

      //punkt 3  - zakładam, że wybieramy tylko ze śpiących
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
        }
      });

      //punkt 4
      nodes.forEach(n => {
        n.wake_time = CyUtil.sleeptime() + t;
      });

      //punkt 5 - trzeba sprawdzić, żebyśmy nie powtarzali node'ów
      let nodesAwaken = this.nodesSleep.filter(n => n.wake_time <= t);

      nodesAwaken.forEach(n => {
        let linkNode = CyUtil.getRandomLink(n);
        if (linkNode !== n) {
          n.links.push(linkNode);
          linkNode.links.push(n);
        }
      });

      //punkt 6
      let newNodesDead = nodesAwaken.filter(n => n.death_time <= t);
      //Usuwamy nowe martwe node'y ze ze śpiących
      this.nodesSleep = this.nodesSleep.filter(n => !newNodesDead.includes(n));
      this.nodesDead = this.nodesDead.concat(newNodesDead);

      this.nodesSleep = this.nodesSleep.concat(nodes);

      console.log("Iteration: " + t);
      console.log(this.nodesDead.length);
      console.log(this.nodesSleep.length);
    }

    //Przetwarzanie danych dla cytoscape
    this.nodesSleep.forEach(n => {
      this.nodesAll.push({ data: { id: n.id } });

      let mainId = n.id;

      if (!!n.links)
        n.links.forEach(ln => {
          if (!!ln) {
            this.edgesAll.push({ data: { source: mainId, target: ln.id } });
          }
        });
    });

    this.nodesDead.forEach(n => {
      this.nodesAll.push({ data: { id: n.id } });

      let mainId = n.id;

      if (!!n.links)
        n.links.forEach(ln => {
          if (!!ln) {
            this.edgesAll.push({ data: { source: mainId, target: ln.id } });
          }
        });
    });

    return { nodes: this.nodesAll, edges: this.edgesAll };
  };
}
