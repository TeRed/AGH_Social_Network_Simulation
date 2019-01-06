export class CyUtil {
  // N = (t) => Math.abs(Math.floor(3900*t*t + 76000*t - 130000));
  static N(t) {
    if(t > 15) {
      return Math.floor(Math.random() * (20 - 8) + 8);
    }
    return Math.abs(Math.floor(Math.exp(0.25 * t)));
  }

  static sleeptime() {
    return Math.floor(this.lifetime() / 10); // Jak oni to robią kompletnie tego nie rozumiem
  }

  static lifetime() {
    const lambda = 0.08;
    return Math.floor(-Math.log(1.0 - Math.random()) / lambda);
  }

  static getRandomLink(node) {
    let node1 = node.links[Math.floor(Math.random() * node.links.length)];
    if(node1 === undefined) return undefined;
    return node1.links[Math.floor(Math.random() * node1.links.length)];
  }

  // Powinny być wybierany te z wieloma linkami z większym prawdopodobienstwem
  static lookForManyLinksNode(nodes) {
    let probabilityNodes = nodes.flatMap(n =>
      Array.apply(null, Array(n.links.length)).map(() => n)
    );

    if (probabilityNodes.length === 0) probabilityNodes = nodes;

    return probabilityNodes[
      Math.floor(Math.random() * probabilityNodes.length)
    ];
  }

  static calculateAverageClustering(t, nodesSleep) {
    let triangles = 0
    const nodes = nodesSleep;
    const trials = nodes.length;

    nodes.forEach(n => {
      if(n.links.length >= 2) {
        const shuffled = n.links.sort(() => .5 - Math.random());
        const [u, v] = shuffled.slice(0,2);

        if(u.links.includes(v)) triangles++;
      }
    });

    console.log(`CC(${t}) = ' + ${triangles / trials}`);
    return triangles / trials;
  }

  static calculateGraphDensity(it, nodes, edges) {
    
  }

  static nodesEdgesNumberPlotData(nodesSleep) {
    const dataPoints = [];
    const map = new Map();

    nodesSleep.forEach(n => {
      const numberOfLinks = n.links.length;

      if(map.has(numberOfLinks))
        map.set(numberOfLinks, map.get(numberOfLinks) + 1);
      else
        map.set(numberOfLinks, 1);
    });

    Object.keys(map).forEach(key => {
      dataPoints.push({ label: key, y: map[key] });
    });

    return dataPoints;
  }
}
