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

    const width = 1100 * 2;
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
            if (d.label == "Purchased other goods and services" && (d.y1 - d.y0) > 60)
                return `Purchased other\ngoods and services\n${(d.emission / reference_emission * 100).toFixed(2)}% ${d.emission.toFixed(2)}kg CO2-Eq`
            return `${d.label} ${(d.emission / reference_emission * 100).toFixed(2)}%${d.emission / reference_emission * 100 > 3 ? `\n${d.emission.toFixed(2)}kg CO2-Eq` : ''}`
        })
        .call(wrap);

    return svg.node();
}

async function fetchData(id) {
    let response = await fetch("/api/sankey/" + id)
    let result = await response.json();
    return result
}

async function renderSankey(id) {
    const sankey_data = await fetchData(id)
    const svgNode = createGraph(sankey_data)
    document.getElementById("graph-container").innerHTML = ""
    document.getElementById("graph-container").appendChild(svgNode)
    const table = document.getElementById("table-container")
    table.classList.add("hidden")
}

document.addEventListener("DOMContentLoaded", () => {
    initialiseFilters([
        "activity",
        "product",
        "cpc-code",
        "cpc-name",
        "geography",
        "layers",
    ])

    initialiseTable([
        "activity",
        "product",
        "geography",
        "cpc_code",
        "cpc_name",
        "layers"
    ], (i) => { renderSankey(i) })

    document.getElementsByTagName("h1")[0].addEventListener('click', () => {
        const table = document.getElementById("table-container")
        table.classList.toggle("hidden")
    })
})