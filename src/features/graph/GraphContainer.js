import React from "react";
import "./GraphContainer.css";
import cytoscape from "cytoscape";
import uniqid from "uniqid";
import { CyUtil } from "../utils/CyUtil";

export default class GraphContainer extends React.Component {
  // cytoscape reference
  CY = null;

  nodesSleep = [];
  nodesDead = [];
  T = 20;
  currentT = 1;

  averageClustering(t) {
    let triangles = 0
    const nodes = this.nodesSleep;
    const trials = nodes.length;

    nodes.forEach(n => {
      if(n.links.length >= 2) {
        const shuffled = n.links.sort(() => .5 - Math.random());
        const [u, v] = shuffled.slice(0,2);

        if(u.links.includes(v)) triangles++;
      }
    });

    console.log(`CC(${t}) = ' + ${triangles / trials}`);
  }

  render() {
    return <div className={"GraphContainer"} id="cy" />;
  }

  componentDidMount() {
    this.CY = cytoscape({
      container: document.getElementById("cy"),
      layout: {
        name: "cose"
      }
    });

    setTimeout(() => {
      for (let t = 1; t < this.T; t++) {
        setTimeout(() => this.simulate(t), t * 1000);
      }
    }, 0);
  }

  simulate = t => {
    // punkt 1
    // Oni mają do tego funkcje ale ona zwraca strasznie duze liczby
    let nodes = Array.apply(null, Array(CyUtil.N(t))).map(() => ({
      id: uniqid()
    }));

    this.CY.add(nodes.map(el => ({ group: "nodes", data: { id: el.id } })));

    // punkt 2
    nodes.forEach(n => {
      n.deathTime = CyUtil.lifetime() + t;
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
        this.CY.add({
          group: "edges",
          data: { source: n.id, target: linkNode.id }
        });
      }
    });

    //punkt 4
    nodes.forEach(n => {
      n.wakeTime = CyUtil.sleeptime() + t;
    });


    //punkt 5 - trzeba sprawdzić, żebyśmy nie powtarzali node'ów
    let nodesAwaken = this.nodesSleep.filter(n => n.wakeTime <= t);

    nodesAwaken.forEach(n => {
      let linkNode = CyUtil.getRandomLink(n);
      if (linkNode !== n) {
        n.links.push(linkNode);
        linkNode.links.push(n);
        this.CY.add({
          group: "edges",
          data: { source: n.id, target: linkNode.id }
        });
      }
    });

    //punkt 6
    let newNodesDead = nodesAwaken.filter(n => n.deathTime <= t);
    newNodesDead.forEach(n => {
      n.links.forEach(el => {
        el.links = el.links.filter(item => item !== n);
      });
      this.CY.remove(this.CY.$('#' + n.id));
    });

    //Usuwamy nowe martwe node'y ze ze śpiących
    this.nodesSleep = this.nodesSleep.filter(n => !newNodesDead.includes(n));
    this.nodesDead = this.nodesDead.concat(newNodesDead);

    this.nodesSleep = this.nodesSleep.concat(nodes);
    this.CY.layout({ name: "cose", animate: 'end', componentSpacing: 15 }).run();

    this.averageClustering(t);
  };
}
