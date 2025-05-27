const ROOT_NODE_COLOUR = "#983334"

TAG_INFORMATION = {
    "root": {
        "colour": "#983334",
        "full_name": "Root node"
    },
    "renewable_wind": {
        "colour": "#8fd14d",
        "full_name": "Renewable energy"
    },
    "renewable_hydro": {
        "colour": "#8fd14d", //"#66a22a",
        "full_name": "Renewable energy"
    },
    "renewable_solar": {
        "colour": "#8fd14d", //"#b3e085",
        "full_name": "Renewable energy"
    },
    "renewable_geothermal": {
        "colour": "#8fd14d", //"#8fe33b",
        "full_name": "Renewable energy"
    },
    "renewable_methanol": {
        "colour": "#8fd14d", //"#66b319",
        "full_name": "Renewable energy"
    },
    "renewable_biogas": {
        "colour": "#8fd14d", //"#b3ec79",
        "full_name": "Renewable energy"
    },
    "renewable_biometahne": {
        "colour": "#8fd14d", //"#8fc15c",
        "full_name": "Renewable energy"
    },
    "renewable_ethanol": {
        "colour": "#8fd14d", //"#669438",
        "full_name": "Renewable energy"
    },
    "renewable_biodiesel": {
        "colour": "#8fd14d", //"#b3d590",
        "full_name": "Renewable energy"
    },
    "production_process": {
        "colour": "#B0D1FF", // "#85b8ff",
        "full_name": "Scope 1"
    },
    "gaseous_fuel": {
        "colour": "#B0D1FF", // "#cce1ff",
        "full_name": "Scope 1"
    },
    "liquid_fuel": {
        "colour": "#B0D1FF", // "#d0e2fb",
        "full_name": "Scope 1"
    },
    "solid_fuel": {
        "colour": "#B0D1FF", // "#8eb9f6",
        "full_name": "Scope 1"
    },
    "electricity": {
        "colour": "#0AC7CE",// "#12CDD4",
        "full_name": "Scope 2"
    },
    "heat_and_steam": {
        "colour": "#0AC7CE", // "#0c888d",
        "full_name": "Scope 2"
    },
    "cooling": {
        "colour": "#0AC7CE", // "#22bec3",
        "full_name": "Scope 2"
    },
    "purchased_goods_and_services": {
        "colour": "#414BB2",
        "full_name": "Purchased goods and services"
    },
    "transport_and_distribution": {
        "colour": "#7D5CD9", // "#383e7a", 
        "full_name": "Transport and distribution"
    },
    "fuel_and_energy_related_activities": {
        "colour": "#757897", // "#505695",
        "full_name": "Fuel and energy related activities"
    },
    "business_travel": {
        "colour": "#79D5F9", // "#5057a5",
        "full_name": "Business travel"
    },
    "capital_goods": {
        "colour": "#EAD082", // "#878cc5",
        "full_name": "Capital goods"
    },
    "waste": {
        "colour": "#F2A47E", // "#7981d2",
        "full_name": "Waste"
    },
    // "intermediate": {
    //     "colour": "#ce5a5a",
    //     "full_name": "Intermediate"
    // },
}

function getColourFromTag(tag) {
    if (tag in TAG_INFORMATION) {
        return TAG_INFORMATION[tag]["colour"]
    }
    return null
}

function getColourForLayer(layer) {
    colors = [
        "#cc503e",
        "#994e95",
        "#666",
        "#1d6996",
        "#858B4F",
        "#edad08",
        "#72af48",
        "#94346e",
        "#660A8A",
        "#38a6a5",
        "#e17c06",
        "#AF614B",
        "#5f4690",
        "#0d8554",
        "#6f4070",
    ]

    return colors[layer % colors.length]
}

function getNodeColour(node, parent, settings) {
    if (node.data.contribution == 0)
        return "#fff"
    else if (node.data.colour)
        return node.data.colour
    else if (settings.graphColouring == GraphColouring.TAG && node.depth == 0)
        return ROOT_NODE_COLOUR
    else if (settings.graphColouring == GraphColouring.TAG && node.data.tag && getColourFromTag(node.data.tag))
        return getColourFromTag(node.data.tag)
    else if (settings.graphColouring == GraphColouring.TAG && node.data.isAtBoundary)
        return generateColour()
    else
        return getColourForLayer(node.depth)
}

function getNodeSize(node) {
    let normalised = Math.min(node.data.contribution / 10, 1);
    //linearSize = normalised * 180 + 20;
    let b = Math.log(180 / 20) / (1 - 0)
    let a = 20 / Math.exp(b * 0)
    return a * Math.exp(b * normalised)
}

function getNodeBorderColour(node, parent, settings) {
    if (node.data.expandable === false && node.data.contribution != 0)
        return "#fff"
    else if (node.data.contribution != 0)
        return "#000"
    else if (node.data.colour)
        return node.data.colour
    else if (settings.graphColouring == GraphColouring.TAG && node.depth == 0)
        return ROOT_NODE_COLOUR
    else if (settings.graphColouring == GraphColouring.TAG && node.data.tag && getColourFromTag(node.data.tag))
        return getColourFromTag(node.data.tag)
    else
        return getColourForLayer(node.depth)
}

function wrap(text, width) {
    text.each(function () {
        let text = d3.select(this),
            fullText = text.text(),
            words = fullText.split(/\s+/).reverse(),
            word,
            line = [],
            lineHeight = 1.2, // ems
            dy = parseFloat(text.attr("dy") || 0),
            lines = [];
        text.text(null).attr("x", 0).attr("y", 0).attr("font-size", "16px")

        let textLength = fullText.length
        let fontSize = 16
        if (textLength >= 110) {
            fontSize = 10
        } else if (textLength >= 80) {
            fontSize = 12
        } else if (textLength >= 50) {
            fontSize = 14
        }
        text.attr("font-size", String(fontSize) + "px")

        while (word = words.pop()) {
            line.push(word)
            if (line.join(" ").length > width * 16 / fontSize) {
                line.pop()
                lines.push(line.join(" "))
                line = [word]
            }
        }

        if (line.length > 0) {
            lines.push(line.join(" "))
        }

        if (lines.length >= 11) {
            lines = lines.slice(0, 10)
            lines.push("...")
        }

        let start = -(lines.length - 1) / 2
        for (let i = 0; i < lines.length; i += 1) {
            text.append("tspan").attr("x", 0).attr("y", 0).attr("dy", `${(start + i) * lineHeight + dy}em`).text(lines[i])
        }
    })
}

async function redirect(newid) {
    const currentUrl = new URLSearchParams(window.location.search)
    const nextPage = new URLSearchParams(window.location.search)
    nextPage.delete('id')
    nextPage.append('id', newid)
    nextPage.append('breadcrumbs', currentUrl.get("id"))
    nextPage.delete('viewbox')

    console.log(currentUrl.get('id'))
    const graph = await fetchGraph(currentUrl.get("id"))
    const viewboxes = window.history.state.viewboxes || []

    window.history.pushState({ 'graph': graph, viewboxes }, "", "/graph?" + nextPage.toString())

    initialiseGraphView()
    initialiseBreadcrumbs(viewboxes)
}

async function fetchGraphlet(nodeData) {
    const form = new FormData()
    form.append("graph_id", nodeData["id"])
    form.append("graph-type", "graphlet")
    const newEntry = await getPage(0, 1, form)
    if (newEntry.length == 0)
        return
    redirect(newEntry[0]["id"])
}

async function showSubGraph(nodeData) {
    const currentUrl = new URLSearchParams(window.location.search)

    const entry = await fetchTableEntry(currentUrl.get("id"))


    if ("id" in nodeData) {
        fetchGraphlet(nodeData)
        return;
    }

    if (!("graphType" in nodeData)) {
        return
    }

    if (nodeData.graphType == "graphlet") {
        fetchGraphlet(nodeData)
        return
    }
    else if (nodeData.graphType == "region") {
        const form = new FormData()
        form.append("graph_id", nodeData["graphId"])
        form.append("graph-type", "region")
        const newEntry = (await getPage(0, 1, form))[0]
        redirect(newEntry["id"])
        return
    }

    if (entry["type"] == "supply_chain" || entry["type"] == "supply_chain_reduced") {
        if (!("categoryGraphId" in nodeData))
            return

        const form = new FormData()
        form.append("graph_id", nodeData["categoryGraphId"])
        form.append("graph-type", "product_category")
        const newEntry = (await getPage(0, 1, form))[0]
        redirect(newEntry["id"])
        return
    } else if (entry["type"] == "product_category") {
        const form = new FormData()
        form.append("graph_id", nodeData["graphId"])
        form.append("graph-type", "region")
        const newEntry = (await getPage(0, 1, form))[0]
        redirect(newEntry["id"])
    } else if (entry["type"] == "region") {
        const form = new FormData()
        form.append("graph_id", nodeData["id"])
        form.append("graph-type", "graphlet")
        const newEntry = (await getPage(0, 1, form))[0]
        redirect(newEntry["id"])
    } else if (entry["type"] == "graphlet") {
        const form = new FormData()
        if ("id" in nodeData) {
            form.append("graph_id", nodeData["id"])
            form.append("graph-type", "graphlet")
        } else {
            form.append("graph_id", nodeData["graphId"])
            form.append("graph-type", "region")
        }
        const newEntry = await getPage(0, 1, form)
        if (newEntry.length == 0)
            return

        redirect(newEntry[0]["id"])
    }
}