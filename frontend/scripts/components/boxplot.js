const width = 928;
const height = 600
const marginTop = 20;
const marginRight = 20;
const marginBottom = 250;
const marginLeft = 40;

function getKeys(data) {
    let keys = Object.keys(data)
    const index = keys.indexOf("priorities")
    keys.splice(index, 1)
    keys.sort((a, b) => data["priorities"][a] == data["priorities"][b] ? a > b : data["priorities"][a] > data["priorities"][b])
    return keys
}

function getBins(data) {
    let bins = []
    let i = 0
    const MARGIN = 0
    const keys = getKeys(data)
    let binCount = keys.length
    console.log(binCount)
    for (const key of keys) {
        console.log(key)
        let bin = data[key]
        bin.sort()
        const min = bin[0]
        const max = bin[binCount - 1]
        const q1 = d3.quantile(bin, 0.25)
        const q2 = d3.quantile(bin, 0.5)
        const q3 = d3.quantile(bin, 0.75)
        const iqr = q3 - q1
        const r0 = Math.max(min, q1 - iqr * 1.5)
        const r1 = Math.min(max, q3 + iqr * 1.5)
        bin.quartiles = [q1, q2, q3]
        bin.range = [r0, r1]
        bin.outliers = bin.filter(v => v < r0 || v > r1)
        bin.x0 = i * (1 / binCount) + MARGIN
        bin.x1 = (i + 1) * (1 / binCount) - MARGIN
        bins.push(bin)
        i += 1
    }
    return bins
}

function drawActivity(data) {

    let bins = getBins(data)

    // Prepare the positional scales.
    const x = d3.scaleLinear()
        .domain([0, 1])
        .rangeRound([marginLeft, width - marginRight])
    const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height - marginBottom, marginTop])

    const xLabels = d3.scaleBand()
        .domain(getKeys(data))
        .range([marginLeft, width - marginRight])

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
        .attr("text-anchor", "middle");

    // Create a visual representation for each bin.
    const g = svg.append("g")
        .selectAll("g")
        .data(bins)
        .join("g");

    // Range.
    g.append("path")
        .attr("stroke", "currentColor")
        .attr("d", d => `
        M${x((d.x0 + d.x1) / 2)},${y(d.range[1])}
        V${y(d.range[0])}
      `);

    // Quartiles.
    g.append("path")
        .attr("fill", "#ddd")
        .attr("d", d => `
        M${x(d.x0) + 1},${y(d.quartiles[2])}
        H${x(d.x1)}
        V${y(d.quartiles[0])}
        H${x(d.x0) + 1}
        Z
      `);

    // Median.
    g.append("path")
        .attr("stroke", "currentColor")
        .attr("stroke-width", 2)
        .attr("d", d => `
        M${x(d.x0) + 1},${y(d.quartiles[1])}
        H${x(d.x1)}
      `);

    // Outliers, with a bit of jitter.
    g.append("g")
        .attr("fill", "currentColor")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "none")
        .attr("transform", d => `translate(${x((d.x0 + d.x1) / 2)},0)`)
        .selectAll("circle")
        .data(d => d.outliers)
        .join("circle")
        .attr("r", 2)
        .attr("cx", () => (Math.random() - 0.5) * 4)
        .attr("cy", d => y(d[1]));

    // Append the x axis.
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(xLabels).tickSizeOuter(0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-65)");

    // Append the y axis.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(null, "s"))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Organisation contribution fraction"));
    document.getElementById("graph-container").appendChild(svg.node())
}

document.addEventListener("DOMContentLoaded", async () => {
    const searchParamsCurrent = new URLSearchParams(window.location.search)
    const data = await (await fetch("/api/boxplots/" + searchParamsCurrent.get("id"))).json()
    drawActivity(data)
})