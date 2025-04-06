const linkColor = "source"

function wrap(text) {
    text.each(function () {
        let text = d3.select(this),
            fullText = text.text(),
            lines = fullText.split("\n"),
            x = text.attr('x') || 0,
            y = text.attr('y') || 0

        text.text(null)
        for (let i = 0; i < lines.length; i++) {
            text.append("tspan").attr("x", x).attr("y", y).attr('dx', 0).attr("dy", 16 * i).text(lines[i])
        }
    })
}

function createGraph(data) {

    const reference_emission = data["emission"]

    const width = 928 * 2;
    const height = 600 * 2;
    const format = d3.format(",.3f");

    // Create a SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])

    // Constructs and configures a Sankey generator.
    const sankey = d3.sankey()
        .nodeId(d => d.name)
        //.nodeAlign(d => d.depth) // d3.sankeyLeft, etc.
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 5], [width - 1, height - 5]]);

    // Applies it to the data. We make a copy of the nodes and links objects
    // so as to avoid mutating the original.
    const { nodes, links } = sankey({
        nodes: data.nodes.map(d => Object.assign({}, d)),
        links: data.edges.map(d => Object.assign({}, d))
    });

    // // Defines a color scale.
    // const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Creates the rects that represent the nodes.
    const rect = svg.append("g")
        .attr("stroke", "#000")
        .selectAll()
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => d.colour /*color(d.category)*/);

    // Adds a title on the nodes.
    rect.append("title")
        .text(d => `${d.label}\n${format(d.value)} kg CO2-Eq`);

    // Creates the paths that represent the links.
    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .selectAll()
        .data(links)
        .join("g")
        .style("mix-blend-mode", "multiply");

    // Creates a gradient, if necessary, for the source-target color option.
    // if (linkColor === "source-target") {
    //     const gradient = link.append("linearGradient")
    //         .attr("id", d => (d.uid = DOM.uid("link")).id)
    //         .attr("gradientUnits", "userSpaceOnUse")
    //         .attr("x1", d => d.source.x1)
    //         .attr("x2", d => d.target.x0);
    //     gradient.append("stop")
    //         .attr("offset", "0%")
    //         .attr("stop-color", d => color(d.source.category));
    //     gradient.append("stop")
    //         .attr("offset", "100%")
    //         .attr("stop-color", d => color(d.target.category));
    // }

    // link.append("path")
    //     .attr("d", d3.sankeyLinkHorizontal())
    //     .attr("stroke", linkColor === "source-target" ? (d) => d.uid
    //         : linkColor === "source" ? (d) => color(d.source.category)
    //             : linkColor === "target" ? (d) => color(d.target.category)
    //                 : linkColor)
    //     .attr("stroke-width", d => Math.max(1, d.width));

    link.append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", d => d.source.colour)
        .attr("stroke-width", d => Math.max(1, d.width));

    link.append("title")
        .text(d => `${d.source.label} → ${d.target.label}\n${format(d.value)} kg CO2-Eq`);

    // Adds labels on the nodes.
    svg.append("g")
        .selectAll()
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => {
            if (d.label == "Purchased other agri-food goods" && d.emission / reference_emission * 100 > 3)
                return `Purchased other\nagri-food goods\n${(d.emission / reference_emission * 100).toFixed(2)}% ${d.emission.toFixed(2)}kg CO2-Eq`
            return `${d.label} ${(d.emission / reference_emission * 100).toFixed(2)}%${d.emission / reference_emission * 100 > 3 ? `\n${d.emission.toFixed(2)}kg CO2-Eq` : ''}`
        })
        .call(wrap);

    return svg.node();
}

async function fetchData(layerCount) {
    let response = await fetch("/api/sankey/" + layerCount)
    let result = await response.json();
    return result
}

async function onLayerCountChange(ev) {
    console.log("AJHKSJASD")
    const sankey_data = await fetchData(ev.target.value)
    const svgNode = createGraph(sankey_data)
    document.getElementById("graph-container").innerHTML = ""
    document.getElementById("graph-container").appendChild(svgNode)
}

document.addEventListener("DOMContentLoaded", async () => {
    const sankey_data = await fetchData("4")
    console.log(sankey_data)
    const svgNode = createGraph(sankey_data)
    document.getElementById("graph-container").appendChild(svgNode)

    document.getElementById("layer-count").addEventListener("change", onLayerCountChange)
})