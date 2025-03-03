function createRadialGraph(rootNode) {
    const settings = getSettings()

    // Specify the chart’s dimensions.
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const height = 0.9 * vh;
    const width = 0.8 * vw;
    const radius = settings.tidyTreeRadius

    const tree = d3.tree()
        .size([2 * Math.PI, Math.min(width, height) * 1000 - 30])
        .separation((a, b) => ((a.parent == b.parent ? 2 : 2) / a.depth));

    // Compute the graph and start the force simulation.
    const root = tree(d3.hierarchy(rootNode))

    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        d.colour = getNodeColour(d, d.parent, settings)
    });

    viewbox = [-width / 2, -height / 2, width, height]

    // Create the container SVG.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", viewbox);

    const firstNodeOffset = 0

    // Append links.
    svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll()
        .data(root.links(), d => d.target.id)
        .join("line")
        .attr("x1", d => (d.source.depth) * radius * Math.cos(d.source.x - Math.PI))
        .attr("y1", d => ((d.source.depth) * radius + (d.source.depth == 0 ? firstNodeOffset : 0)) * Math.sin(d.source.x - Math.PI))
        .attr("x2", d => (d.target.depth) * radius * Math.cos(d.target.x - Math.PI))
        .attr("y2", d => ((d.target.depth) * radius + (d.target.depth == 0 ? firstNodeOffset : 0)) * Math.sin(d.target.x - Math.PI));

    // Append nodes.
    svg.append("g")
        .selectAll()
        .data(root.descendants())
        .join("circle")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 180}) translate(${(d.depth) * radius},0) translate(0, ${d.depth == 0 ? firstNodeOffset : 0})`)
        .attr("fill", d => d.colour)
        .attr("stroke", d => d.data.childCount == 0 ? "#fff" : "#000")
        .attr("stroke-width", 3)
        .attr("r", d => 80)
        .on('dblclick', (event, d) => { showSubGraph(d.data) })
        .on('click', (event, d) => { updateSidePanel(d.data) })

    // Append labels.
    svg.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll()
        .data(root.descendants())
        .join("text")
        .text(d => d.data.name)
        .attr("alignment-baseline", "central")
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "middle")
        .attr("fill", d => invertColour(d.colour, true))
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 180}) translate(${(d.depth) * radius} ,0) rotate(${(d.x >= Math.PI / 2 && d.x <= 3 * Math.PI / 2) ? 0 : 180}) translate(0, ${d.depth == 0 ? firstNodeOffset : 0})`)
        .call(wrap, 10)
        .on('dblclick', (event, d) => { showSubGraph(d.data) })
        .on('click', (event, d) => { updateSidePanel(d.data) })

    return svg;
}