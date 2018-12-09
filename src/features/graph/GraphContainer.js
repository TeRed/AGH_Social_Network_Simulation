import React from "react";
import "./GraphContainer.css";
import cytoscape from 'cytoscape';
import uniqid from 'uniqid';

export default class GraphContainer extends React.Component {
    constructor(props) {
        super(props);

        this.nodesSleep = [];
        this.nodesDead = [];
        this.T = 100;

        this.nodesAll = [];
        this.edgesAll = [];
    }

    render() {
        let cyStyle = {
            height: '100vh',
            width: '100%'
        };
        return <div style={cyStyle} id="graph"></div>;
    }

    componentDidMount() {
        cytoscape({
            container: document.getElementById('graph'),
            elements: this.simulate()
        });
    }

    N = (t) => Math.floor(3900*t*t + 76000*t - 13000);
    lifetime = () => {
        const lambda = 0.0018;
        return Math.floor(-Math.log(1.0 - Math.random()) / lambda);
    }

    sleeptime = () => Math.floor(this.lifetime() / 10); // Jak oni to robią kompletnie tego nie rozumiem

    // Powinny być wybierany te z wieloma linkami z większym prawdopodobienstwem
    lookForManyLinksNode = (nodes) => nodes[Math.floor(Math.random() * nodes.length)];
    
    getRandomLink = (node) => {
        if(!!node.links) return;
        let node1 = node.links[Math.floor(Math.random() * node.links.length)];
        if(!!node1.links) return;
        return node1.links[Math.floor(Math.random() * node1.links.length)];
    }

    simulate = () => {
        for(let t = 1; t < this.T; t++) {
            // punkt 1
            let nodes = [];
            // Stała ilość w kazdej iteracji
            // Oni mają do tego funkcje ale ona zwraca strasznie duze liczby
            for(let i = 0; i < 10; i++) {
                nodes.push({id: uniqid()});
            }
            
            // punkt 2
            nodes.forEach(n => {n.death_time = this.lifetime() + t});
            
            //punkt 3  - zakładam, że wybieramy tylko ze śpiących i nowych
            nodes.forEach(n => {n.links = [this.lookForManyLinksNode(this.nodesSleep.concat(nodes))]});
            
            //punkt 4
            nodes.forEach(n => {n.wake_time = this.sleeptime() + t});

            this.nodesSleep = this.nodesSleep.concat(nodes);
            
            //punkt 5 - trzeba sprawdzić, żebyśmy nie powtarzali node'ów
            let nodesAwaken = this.nodesSleep.filter(n => n.wake_time <= t);
            nodesAwaken.forEach(n => {n.links.push(this.getRandomLink(n))});
            
            //punkt 6
            let newNodesDead = nodesAwaken.filter(n => n.death_time <= t);
            //Usuwamy nowe martwe node'y
            this.nodesSleep = this.nodesSleep.filter(n => !newNodesDead.includes(n));

            this.nodesDead = this.nodesDead.concat(newNodesDead);
        }

        //Dalej to jest przerabioanie danych dla cytoscape
        this.nodesSleep.forEach(n => {
            this.nodesAll.push({data:{id: n.id}});

            let mainId = n.id;

            if(!!n.links)
            n.links.forEach(ln => {
                if(!!ln) {
                    this.edgesAll.push({data:{source: mainId, target: ln.id}});
                }
            });
        });

        this.nodesDead.forEach(n => {
            this.nodesAll.push({data:{id: n.id}});

            let mainId = n.id;

            if(!!n.links)
            n.links.forEach(ln => {
                if(!!ln) {
                    this.edgesAll.push({data:{source: mainId, target: ln.id}});
                }
            });
        });

        console.log(this.nodesDead);
        console.log({nodes: this.nodesAll, edges: this.edgesAll});
        return {nodes: this.nodesAll, edges: this.edgesAll};
    }
}
