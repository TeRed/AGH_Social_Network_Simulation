export class CyUtil {
  // N = (t) => Math.abs(Math.floor(3900*t*t + 76000*t - 130000));
  static N(t) {
    return Math.abs(Math.floor(Math.exp(0.25 * t)));
  }

  static sleeptime() {
    return Math.floor(this.lifetime() / 10); // Jak oni to robią kompletnie tego nie rozumiem
  }

  static lifetime() {
    const lambda = 0.0092;
    return Math.floor(-Math.log(1.0 - Math.random()) / lambda);
  }

  static getRandomLink(node) {
    let node1 = node.links[Math.floor(Math.random() * node.links.length)];
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
}
