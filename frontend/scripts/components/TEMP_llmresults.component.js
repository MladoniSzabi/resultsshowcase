function updateSidePanel(data) {
    if ("text" in data) {
        const sp = document.getElementById("side-panel")
        sp.innerHTML = ""
        pre = document.createElement("pre")
        pre.innerText = data["text"]
        sp.appendChild(pre)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const height = 0.9 * vh;
    const width = 0.8 * vw;

    // Compute the graph and start the force simulation.
    const root = d3.hierarchy(GRAPH);

    const links = root.links();
    const nodes = root.descendants();

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(500).strength(0.1))
        .force("charge", d3.forceManyBody().strength(-800));

    viewbox = [-width / 2, -height / 2, width, height]
    initialViewbox = viewbox

    // Create the container SVG.
    svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", viewbox);

    const gLink = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)

    const gNode = svg.append("g")

    simulation.nodes(nodes)
    simulation.force('link').links(links)

    // Append links.
    let link = gLink
        .selectAll("line")
        .data(links, d => d.target.id)

    link.exit().remove()

    const linkEnter = link.enter().append("line")

    link = linkEnter.merge(link)

    // Append nodes.
    let node = gNode
        .selectAll("g")
        .data(nodes, d => d.id)

    node.exit().remove()

    const nodeEnter = node.enter()
        .append("g")
        .call(drag(simulation))

    nodeEnter.on('click', (event, d) => { updateSidePanel(d.data) })

    nodeEnter.append("circle")
        .attr("fill", d => d.data.colour ? d.data.colour : "#fff")
        .attr("stroke", "#000")
        .attr("stroke-width", 3)
        .attr("r", 80)

    nodeEnter.append("text")
        .text(d => d.data.name)
        .attr("alignment-baseline", "central")
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .call(wrap, 10);

    node = nodeEnter.merge(node)

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    document.getElementById("svg-container").appendChild(svg.node())

    const svgNode = svg.node()
    svgNode.addEventListener("wheel", handleScroll)
    svgNode.addEventListener("mousedown", handleMouseDown)
    svgNode.addEventListener("touchmove", handleTouchMove);
    svgNode.addEventListener("touchend", handleTouchEnd)

    document.getElementById("zoom-in").addEventListener('click', handleZoomInPressed)
    document.getElementById("zoom-out").addEventListener('click', handleZoomOutPressed)

    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mousemove", handleMouseMove)
})