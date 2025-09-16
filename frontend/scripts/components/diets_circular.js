function getOrders(nodes, links) {
    const degree = d3.rollup(
        links.flatMap(({ source, target, value }) => [
            { node: source, value },
            { node: target, value }
        ]),
        (v) => d3.sum(v, ({ value }) => value),
        ({ node }) => node
    );
    return new Map([
        ["by name", d3.sort(nodes.map((d) => d.id))],
        ["by group", d3.sort(nodes, ({ group }) => group, ({ id }) => id).map(({ id }) => id)],
        //    ["input", nodes.map(({id}) => id)],
        ["by degree", d3.sort(nodes, ({ id }) => degree.get(id), ({ id }) => id).map(({ id }) => id).reverse()]
    ]);
}

function layout(nodes, links, radius) {
    let nodecount = nodes.length
    const name_to_node = {}
    for (const index in nodes) {
        name_to_node[nodes[index]["id"]] = nodes[index]
        let angle = (index / nodecount) * Math.PI * 2
        nodes[index].x = radius * Math.cos(angle)
        nodes[index].y = radius * Math.sin(angle)
        nodes[index].radius = radius
        nodes[index].angle = angle
    }

    const newlinks = []
    for (const l of links) {
        newlinks.push({ source: name_to_node[l.source], target: name_to_node[l.target] })
    }
    return [nodes, newlinks]
}

function drawSvg(data) {
    const [nodes, links] = layout(data["nodes"], data["links"], 180)
    const width = 600;
    const height = 600;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; max-height:100vh; width:100%");

    const line = d3.lineRadial()
        .curve(d3.curveBundle.beta(0.85))
        .radius(d => d.y)
        .angle(d => d.x);

    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .selectAll("path")
        .data(links)
        .join("path")
        // .style("mix-blend-mode", "multiply")
        // .attr("d", ([i, o]) => line(i.path(o)))
        // .each(function (d) { d.path = this; });
        // .attr("d", d3.lineRadial()
        //     .curve(d3.curveBundle.beta(0.85))
        //     .radius(d => d.radius)
        //     .angle(d => d.angle))
        .attr("d", d3.linkRadial()
            .angle(d => d.angle + Math.PI / 2)
            .radius(d => d.radius))
    // .attr("d", (...args) => Math.abs(args[0].source.x - args[0].target.x) >= (args[0].source.y - args[0].target.y) ? d3.linkHorizontal().x(d => d.x).y(d => d.y)(...args) : d3.linkVertical().x(d => d.x).y(d => d.y)(...args))

    let mouseover = false

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 3.5)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("fill", d => color(d.group))
        .attr("pointer-events", "all")
        .on("pointerenter", (event, d) => {
            mouseover = true
            svg.classed("hover", true);
            node.classed("primary", n => n === d);
            node.classed("secondary", n => links.some(({ source, target }) => (
                n === source && d == target || n === target && d === source
            )));
            link.classed("primary", l => l.source === d || l.target === d).filter(".primary").raise();
        })
        .on("pointerout", () => {
            mouseover = false
            setTimeout(() => {
                if (Array.from(document.getElementsByTagName("text")).concat(Array.from(document.getElementsByTagName("circle"))).map((el) => { el.matches("text:hover") }).reduce((acc, el) => acc || el, false)) {
                    svg.classed("hover", false);
                    node.classed("primary", false);
                    node.classed("secondary", false);
                    link.classed("primary", false).order();
                }
            }, 200)
        });

    function shouldRotate(d) {
        return d.angle >= Math.PI / 2 && d.angle <= Math.PI * 1.5
    }

    const labels = svg.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll()
        .data(nodes)
        .join("text")
        .attr("transform", d => `rotate(${d.angle * 180 / Math.PI}) translate(${d.radius + 13},0) rotate(${shouldRotate(d) ? 180 : 0})`)
        .attr("dy", "0.31em")
        .attr("x", d => shouldRotate(d) ? 6 : -6)
        .attr("text-anchor", d => shouldRotate(d) ? "end" : "start")
        .attr("paint-order", "stroke")
        .attr("stroke", "white")
        .attr("font-size", "4.5px")
        .attr("fill", "currentColor")
        .text(d => d.id)
        .on("pointerenter", (event, d) => {
            svg.classed("hover", true);
            node.classed("primary", n => n === d);
            node.classed("secondary", n => links.some(({ source, target }) => (
                n === source && d == target || n === target && d === source
            )));
            labels.classed("primary", n => n === d);
            labels.classed("secondary", n => links.some(({ source, target }) => (
                n === source && d == target || n === target && d === source
            )));
            link.classed("primary", l => l.source === d || l.target === d).filter(".primary").raise();
        })
        .on("pointerout", () => {
            setTimeout(() => {
                if (!Array.from(document.getElementsByTagName("text")).concat(Array.from(document.getElementsByTagName("circle"))).map((el) => el.matches("text:hover")).reduce((acc, el) => acc || el, false)) {
                    svg.classed("hover", false);
                    node.classed("primary", false);
                    node.classed("secondary", false);
                    labels.classed("primary", false);
                    labels.classed("secondary", false);
                    link.classed("primary", false).order();
                }
            }, 200)
        });

    svg.append("style").text(`
    .hover text { fill: #aaa; }
    .hover text.primary { font-weight: bold; fill: #333; }
    .hover text.secondary { fill: #333; }
    .hover circle {opacity: 0.2}
    .hover circle.primary {opacity: 1}
    .hover circle.secondary {opacity: 1}
    .hover path { stroke: #ccc; }
    .hover path.primary { stroke: #333; }
  `);


    return svg.node()
}

const params = new URLSearchParams(document.location.search);
fetch("/diets/data/" + params.get('cluster')).then((data) => data.json()).then((graph) => {
    const svg = drawSvg(graph)
    document.body.appendChild(svg)
})