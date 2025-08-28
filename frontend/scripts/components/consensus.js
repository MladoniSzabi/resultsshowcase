TAG_INFORMATION = {
    "root": {
        "colour": "#983334",
        "full_name": "Root node",
        "scope": 1
    },
    "renewable_methanol": {
        "colour": "#8fd14d", //"#66b319",
        "full_name": "Renewable energy",
        "scope": 1
    },
    "renewable_biogas": {
        "colour": "#8fd14d", //"#b3ec79",
        "full_name": "Renewable energy",
        "scope": 1
    },
    "renewable_biometahne": {
        "colour": "#8fd14d", //"#8fc15c",
        "full_name": "Renewable energy",
        "scope": 1
    },
    "renewable_ethanol": {
        "colour": "#8fd14d", //"#669438",
        "full_name": "Renewable energy",
        "scope": 1
    },
    "renewable_biodiesel": {
        "colour": "#8fd14d", //"#b3d590",
        "full_name": "Renewable energy",
        "scope": 1
    },
    "production_process": {
        "colour": "#B0D1FF", // "#85b8ff",
        "full_name": "Scope 1",
        "scope": 1
    },
    "gaseous_fuel": {
        "colour": "#B0D1FF", // "#cce1ff",
        "full_name": "Scope 1",
        "scope": 1
    },
    "liquid_fuel": {
        "colour": "#B0D1FF", // "#d0e2fb",
        "full_name": "Scope 1",
        "scope": 1
    },
    "solid_fuel": {
        "colour": "#B0D1FF", // "#8eb9f6",
        "full_name": "Scope 1",
        "scope": 1
    },
    "renewable_wind": {
        "colour": "#8fd14d",
        "full_name": "Renewable energy",
        "scope": 2
    },
    "renewable_hydro": {
        "colour": "#8fd14d", //"#66a22a",
        "full_name": "Renewable energy",
        "scope": 2
    },
    "renewable_solar": {
        "colour": "#8fd14d", //"#b3e085",
        "full_name": "Renewable energy",
        "scope": 2
    },
    "renewable_geothermal": {
        "colour": "#8fd14d", //"#8fe33b",
        "full_name": "Renewable energy",
        "scope": 2
    },
    "electricity": {
        "colour": "#0AC7CE",// "#12CDD4",
        "full_name": "Scope 2",
        "scope": 2
    },
    "heat_and_steam": {
        "colour": "#0AC7CE", // "#0c888d",
        "full_name": "Scope 2",
        "scope": 2
    },
    "cooling": {
        "colour": "#0AC7CE", // "#22bec3",
        "full_name": "Scope 2",
        "scope": 2
    },
    "purchased_goods_and_services": {
        "colour": "#414BB2",
        "full_name": "Purchased goods and services",
        "scope": 3
    },
    "transport_and_distribution": {
        "colour": "#7D5CD9", // "#383e7a", 
        "full_name": "Transport and distribution",
        "scope": 3
    },
    "fuel_and_energy_related_activities": {
        "colour": "#757897", // "#505695",
        "full_name": "Fuel and energy related activities",
        "scope": 3
    },
    "business_travel": {
        "colour": "#79D5F9", // "#5057a5",
        "full_name": "Business travel",
        "scope": 3
    },
    "capital_goods": {
        "colour": "#EAD082", // "#878cc5",
        "full_name": "Capital goods",
        "scope": 3
    },
    "waste": {
        "colour": "#F2A47E", // "#7981d2",
        "full_name": "Waste",
        "scope": 3
    },
    // "intermediate": {
    //     "colour": "#ce5a5a",
    //     "full_name": "Intermediate"
    // },
}

function changeGraph(newId) {
    let urlParams = new URLSearchParams(location.search.substring(1))
    urlParams.set("id", newId)
    location.search = urlParams.toString()
}

function getNodeColour(node) {
    if (!node.parent)
        return TAG_INFORMATION["root"]["colour"]
    return TAG_INFORMATION[node.data.tag]["colour"]
}

function splitIntoWord(text) {
    buffer = ""
    words = []
    for (const c of text) {
        if (c == " ") {
            words.push(buffer)
            buffer = ""
        } else if (c == "-") {
            words.push(buffer + "-")
            buffer = ""
        } else {
            buffer += c
        }
    }

    if (buffer) {
        words.push(buffer)
    }
    return words
}

function wrapString(str, width) {
    let word,
        words = splitIntoWord(str).reverse(),
        line = [],
        lines = []

    while (word = words.pop()) {
        line.push(word)
        if (line.join(" ").length > width) {
            line.pop()
            lines.push(line.join(" ").replace("- ", "-"))
            line = [word]
        }
    }

    if (line.length > 0) {
        lines.push(line.join(" ").replace("- ", "-"))
    }

    if (lines.length >= 11) {
        lines = lines.slice(0, 10)
        lines.push("...")
    }

    return lines;
}

function wrap(text, width) {
    text.each(function () {
        let textNode = d3.select(this),
            fullText = textNode.text(),
            word,
            line = [],
            lineHeight = 1.2, // ems
            dy = parseFloat(textNode.attr("dy") || 0),
            lines = [],
            x = parseFloat(textNode.attr("x") || 0)
        textNode.text(null).attr("x", 0).attr("y", 0)

        wordsplit = fullText.split(",")
        if (wordsplit.length > 1) {
            fullText = wordsplit[0] + " " + fullText.split(" ").at(-1)
        } else {
            fullText = wordsplit[0]
        }
        lines = wrapString(fullText, width)

        for (let i = 0; i < lines.length; i += 1) {
            textNode.append("tspan").attr('x', x).attr("dy", `${i == 0 ? (0.31 + dy) : lineHeight}em`).text(lines[i])
        }
    })
}

function getStrokeWidth(edge) {
    const minWidth = 1
    const maxWidth = 7

    return edge.target.data.presence * (maxWidth - minWidth) + minWidth
}

function getNodeSize(node) {
    const minNodeSize = 4
    const maxNodeSize = 60
    if (!node.parent)
        return maxNodeSize

    const proportion = node.data.contribution / node.parent.data.contribution
    const log = Math.log10(proportion * 9 + 1)

    return log * (maxNodeSize - minNodeSize) + minNodeSize
}

function getNodeContributionPercentage(node) {
    if (node.parent)
        return node.data.contribution / node.parent.data.contribution * 100
    return 1
}

function getNodeDistance(node) {
    if (node.children) return 0
    const contribution = getNodeContributionPercentage(node)
    return (0.8 + 0.4 * node.data.layer) * node.y

    if (contribution < 0.5) {
        return node.y * 2
    }
    else if (contribution < 5.5) {
        return node.y * 1.4
    } else {
        return node.y * 0.8
    }
}

const labelPositionFactor = 0.95
const labelDistanceOffset = 10
const labelAngleOffset = (2 * Math.PI / 180)

function getLabelY(edge) {
    const angle = edge.target.x
    const y = Math.sin(angle) * (getNodeDistance(edge.target) - getNodeSize(edge.target))
    const linePos = labelPositionFactor * y

    let labelPos
    if (angle < 0 || angle > Math.PI)
        labelPos = linePos + Math.cos(angle) * labelDistanceOffset
    else
        labelPos = linePos - Math.cos(angle) * labelDistanceOffset

    return labelPos
}

function getLabelX(edge) {
    const angle = edge.target.x
    const x = Math.cos(angle) * (getNodeDistance(edge.target) - getNodeSize(edge.target))
    const linePos = labelPositionFactor * x

    let labelPos
    if (angle < 0 || angle > Math.PI)
        labelPos = linePos - Math.sin(angle) * labelDistanceOffset
    else
        labelPos = linePos + Math.sin(angle) * labelDistanceOffset

    return labelPos
}

function calculateLayers(root) {
    let maxContribution = 0
    for (const child of root.children) {
        maxContribution = Math.max(maxContribution, Math.round(getNodeContributionPercentage(child)))
    }
    maxContribution = Math.ceil(maxContribution / 10) * 10
    let categoryCount = {}
    for (let i = 0; i <= maxContribution / 10; i++) {
        categoryCount[i] = 0
    }
    for (const child of root.children) {
        let category = Math.ceil(Math.round(getNodeContributionPercentage(child)) / 10)
        categoryCount[category] += 1
    }
    let layer = 0
    let categoryToLayer = {}
    for (let i = maxContribution / 10; i >= 0; i--) {
        if (categoryCount[i] != 0) {
            categoryToLayer[i] = layer
            layer += 1
        }
    }
    for (const child of root.children) {
        let category = Math.ceil(Math.round(getNodeContributionPercentage(child)) / 10)
        child.data.layer = categoryToLayer[category]
    }
    return layer
}

function shouldFlipText(node) {
    if (node.children)
        return false
    return node.x > Math.PI / 2 && node.x < Math.PI / 2 * 3
}

function drawActivity(data) {
    const container = document.getElementById("graph-container")

    const baseWidth = 928
    // const tree = d3.cluster().nodeSize([dx, dy])

    const root = d3.hierarchy(data)
    layerCount = calculateLayers(root)

    const width = baseWidth * (0.75 + 0.25 * layerCount)
    const dx = 100
    const dy = width / (root.height + 1)
    const radius = width / 2 - 300

    const tree = d3.cluster()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);
    // root.sort((a, b) => d3.ascending(a.data.product || a.data.name, b.data.product || b.data.name))
    root.sort((a, b) => d3.ascending(TAG_INFORMATION[a.data.tag]["scope"], TAG_INFORMATION[b.data.tag]["scope"]) || d3.descending(Math.round(a.data.contribution * 100), Math.round(b.data.contribution * 100)) || d3.descending(a.data.presence, b.data.presence))
    tree(root)
    for (let child of root.children) {
        child.x -= Math.PI - Math.PI / 8
        if (child.x < 0)
            child.x += Math.PI * 2
    }

    let x0 = Infinity
    let x1 = -x0
    root.each(d => {
        if (d.x > x1) x1 = d.x
        if (d.x < x0) x0 = d.x
    })

    // const height = x1 - x0 + dx * 2
    const height = width

    const cx = width * 0.5; // adjust as needed to fit
    const cy = height * 0.54; // adjust as needed to fit

    const viewBoxMultiplier = (0.75 + 0.25 * layerCount)

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        // .attr("viewBox", [-dy / 3, x0 - dx, width, height])
        .attr("viewBox", [-cx * viewBoxMultiplier, -cy * viewBoxMultiplier * 0.9, width * viewBoxMultiplier, height * viewBoxMultiplier])
        .attr("style", "max-width: 100%, height: auto, font: 10px sans-serif;")

    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .selectAll()
        .data(root.links())
        .join("g")

    // link.append("path")
    //     .attr("stroke-width", 2)
    //     .attr("d", d3.linkRadial()
    //         .angle(d => d.x)
    //         .radius(d => d.y))
    link.append("line")
        .attr("stroke-width", getStrokeWidth)
        .attr("x0", 0)
        .attr("y0", 0)
        .attr("x1", d => getNodeDistance(d.target))
        .attr("y1", 0)
        .attr("transform", d => `rotate(${d.target.x * 180 / Math.PI})`)

    link.append("text")
        .attr("x", getLabelX)
        .attr("y", getLabelY)
        .text(d => `${(d.target.data.presence * 100).toFixed(0)}%`)
        .attr("stroke", "white")
        .attr("paint-order", "stroke")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 1)
        .attr("fill", "black")
        .attr("stroke", "black")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "middle")
        .attr("style", "background: white")
        .attr("font-size", "12px")
        .attr("style", "transform-box: fill-box")
        .attr("transform-origin", "center")
        .attr("transform", d => `rotate(${d.target.x * 180 / Math.PI}) rotate(${shouldFlipText(d.target) ? 180 : 0})`)

    // link.append("circle")
    //     .attr("cx", getLabelX)
    //     .attr("cy", getLabelY)
    //     .attr("r", 2)

    const node = svg.append("g")
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll()
        .data(root.descendants())
        .join("g")

    node.append("circle")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI}) translate(${getNodeDistance(d)}, 0)`)
        .attr("fill", getNodeColour)
        .attr("r", getNodeSize)
        .attr("stroke", d => d.data.connected ? "#000" : "none")


    node.append("text")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI}) translate(${getNodeDistance(d)}, 0) rotate(${d.children ? -180 : 0}) rotate(${shouldFlipText(d) ? 180 : 0})`)
        .attr("text-anchor", d => d.children ? "middle" : (shouldFlipText(d) ? "end" : "start"))
        .attr("dy", d => d.children ? 1 + getNodeSize(d) / 24 : 0)
        .attr("x", d => d.children ? 0 : (shouldFlipText(d) ? -getNodeSize(d) - 5 : getNodeSize(d) + 5))
        .text(d => d.data.product ? (d.data.product + " " + getNodeContributionPercentage(d).toFixed(0) + "%") : d.data.name)
        .attr("stroke", d => d.children ? "#fff" : "none")
        .attr("fill", "#000")
        .attr("paint-order", "stroke")
        .attr("font-size", d => d.children ? "24px" : "18px")
        .attr("class", d => d.children ? "rootNodeLabel" : null)
        .call(wrap, 22)


    node.on('dblclick', (event, d) => { if (d.data.id) changeGraph(d.data.id) })

    container.appendChild(svg.node())

    const rootLabel = svg.node().getElementsByClassName("rootNodeLabel")[0]
    const labelRect = rootLabel.getBBox()
    const paddingX = 3
    const rect = svg.append("rect")
        .attr("x", labelRect.x - paddingX)
        .attr("y", labelRect.y)
        .attr("width", labelRect.width + paddingX * 2)
        .attr("height", labelRect.height)
        .attr("fill", "white")
        .attr("rx", 7)
        .attr("stroke", "#000")
        .attr("stroke-width", 2)

    rootLabel.parentElement.insertBefore(rect.node(), rootLabel)
}

document.addEventListener("DOMContentLoaded", async () => {
    const legend = document.getElementById("legend")
    drawLegend(legend, TAG_INFORMATION)

    const searchParamsCurrent = new URLSearchParams(window.location.search)
    const data = await (await fetch("/api/consensusgraphlets/" + searchParamsCurrent.get("id"))).json()
    drawActivity(data)
})