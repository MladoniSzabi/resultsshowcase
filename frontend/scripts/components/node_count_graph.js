xAxis = [
    "Scope 1",
    "Scope 2",
    "Capital assets",
    "Distribution & business travel",
    "Waste",
    "Non-focal industry"
]

function getPoints(data) {
    let points = []
    for (const key in data) {
        for (const index in data[key])
            points.push([xAxis[Number(index)], data[key][index], key])
    }

    return points
}

function getYAxisBounds(data) {
    let max = 0
    let min = Infinity
    for (const key in data) {
        max = Math.max(max, Math.max(...data[key]))
        min = Math.min(min, Math.min(...data[key]))
    }

    return [1, max]
}

const colours = [
    "#FF4500",
    "#008000",
    "#0000FF",
    "#FFD700",
    "#A52A2A",
    "#2F4F4F",
    "#000000",
]

function createColourMap(categories) {
    let c = {}
    for (const i in categories) {
        c[categories[i]] = colours[i % colours.length]
    }
    return c
}

function drawLegend(container, keys, colours) {
    container.innerHTML = ""

    existingKeys = new Set();

    for (const index in keys) {
        if (existingKeys.has(keys[index])) {
            continue
        }
        existingKeys.add(keys[index])
        const p = document.createElement("p")
        const span = document.createElement("span")
        span.innerText = "⬤ "
        p.innerText = keys[index]
        span.style.color = colours[keys[index]]
        p.prepend(span)

        container.append(p)
    }
}

function drawActivity(data) {
    // Specify the chart’s dimensions.
    const width = 928;
    const height = 600;
    const marginTop = 20;
    const marginRight = 60;
    const marginBottom = 30;
    const marginLeft = 80;

    // Create the positional scales.
    const x = d3.scalePoint()
        .domain(xAxis)
        .range([marginLeft, width - marginRight]);

    console.log(getYAxisBounds(data))
    const y = d3.scaleLog()
        .domain(getYAxisBounds(data)).nice()
        .range([height - marginBottom, marginTop]);

    const colourMap = createColourMap(Object.keys(data))
    drawLegend(document.getElementById("legend-container"), Object.keys(data), colourMap)

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Add the horizontal axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(xAxis.length).tickSizeOuter(0))
        .call(g => g.append("text")
            .attr("x", width)
            .attr("y", marginBottom - 2)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text("Cutoff by ➜")
        );

    // Add the vertical axis.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).tickFormat(d3.format(".1e")))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Number of nodes"));


    // Compute the points in pixel space as [x, y, z], where z is the name of the series.
    console.log(getPoints(data), x, y)
    const points = getPoints(data).map(d => [x(d[0]), y(d[1]), d[2]])
    console.log(points)

    // Group the points by series.
    const groups = d3.rollup(points, v => Object.assign(v, { z: v[0][2] }), d => d[2]);

    // Draw the lines.
    const line = d3.line();
    const path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .selectAll("path")
        .data(groups.values())
        .join("path")
        .attr("stroke", d => colourMap[d[0][2]])
        .style("mix-blend-mode", "multiply")
        .attr("d", line);

    // Add an invisible layer for the interactive tip.
    const dot = svg.append("g")
        .attr("display", "none");

    dot.append("circle")
        .attr("r", 2.5);

    dot.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -8);

    document.getElementById("graph-container").appendChild(svg.node())
}

document.addEventListener("DOMContentLoaded", async () => {
    const data = await (await fetch("/api/nodecount")).json()

    drawActivity(data)
})