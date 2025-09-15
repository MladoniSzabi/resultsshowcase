function drawSvg(data) {
    // Specify the dimensions of the chart.
    const width = 928;
    const height = 680;

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    const linkForce = d3.forceLink(links)
    linkForce.id(d => d.id).distance(100).strength(0)
    const manyBodyForce = d3.forceManyBody()
    manyBodyForce.distanceMax(100).strength(-1000)
    const xForce = d3.forceX()
    const yForce = d3.forceY()


    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", linkForce)
        .force("charge", manyBodyForce)
        // .force("center", d3.forceCenter())
        .force("x", xForce)
        .force("y", yForce);

    simulation.on('tick', () => {
        nodes[0]['x'] = 0
        nodes[0]['y'] = 0
    })


    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Add a line for each link, and a circle for each node.
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("fill", "none")
        .selectAll("line")
        .data(links)
        .join("path")
        .attr("d", d => Math.abs(d.source.x - d.target.x) >= (d.source.y - d.target.y) ? d3.linkHorizontal()(d) : d3.linkVertical()(d))
    //.attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", d => color(d.group));

    node.append("title")
        .text(d => d.id);

    // Add a drag behavior.
    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Set the position attributes of links and nodes each time the simulation ticks.
    simulation.on("tick", () => {
        nodes[0]['x'] = 0
        nodes[0]['y'] = 0
        // link.attr("d", d => Math.abs(d.source.x - d.target.x) >= Math.abs(d.source.y - d.target.y) ? d3.linkHorizontal().x(d => d.x).y(d => d.y) : d3.linkVertical().x(d => d.x).y(d => d.y))
        link.attr("d", (...args) => Math.abs(args[0].source.x - args[0].target.x) >= (args[0].source.y - args[0].target.y) ? d3.linkHorizontal().x(d => d.x).y(d => d.y)(...args) : d3.linkVertical().x(d => d.x).y(d => d.y)(...args))
        // link.attr("d", d3.linkHorizontal()
        //     .x(d => d.x)
        //     .y(d => d.y));

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return [svg.node(), { "link": linkForce, "charge": manyBodyForce, "x": xForce, "y": yForce }];
}

function setForcesStrengths(forces, strength) {
    forces['link'].strength(strength['link'])
    forces['charge'].strength(strength['charge'])
    forces['x'].strength(strength['x'])
    forces['y'].strength(strength['y'])
}

const [svg, forces] = drawSvg(graph)
document.body.appendChild(svg)