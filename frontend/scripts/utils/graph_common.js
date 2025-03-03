const ROOT_NODE_COLOUR = "#983334"

function getColourFromTag(tag) {
    if (tag == "renewable_wind")
        return "#8fd14d"
    else if (tag == "renewable_hydro")
        return "#66a22a"
    else if (tag == "renewable_solar")
        return "#b3e085"
    else if (tag == "renewable_geothermal")
        return "#8fe33b3"
    else if (tag == "renewable_methanol")
        return "#66b319"
    else if (tag == "renewable_biogas")
        return "#b3ec79"
    else if (tag == "renewable_biometahne")
        return "#8fc15c"
    else if (tag == "renewable_ethanol")
        return "#669438"
    else if (tag == "renewable_biodiesel")
        return "#b3d590"
    else if (tag == "production_process")
        return "#85b8ff"
    else if (tag == "gaseous_fuel")
        return "#cce1ff"
    else if (tag == "liquid_fuel")
        return "#d0e2fb"
    else if (tag == "solid_fuel")
        return "#8eb9f6"
    else if (tag == "electricity")
        return "#12CDD4"
    else if (tag == "heat_and_steam")
        return "#0c888d"
    else if (tag == "cooling")
        return "#22bec3"
    else if (tag == "purchased_goods_and_services")
        return "#414BB2"
    else if (tag == "transport_and_distribution")
        return "#383e7a"
    else if (tag == "fuel_and_energy_related_activities")
        return "#505695"
    else if (tag == "business_travel")
        return "#5057a5"
    else if (tag == "capital_goods")
        return "#878cc5"
    else if (tag == "waste")
        return "#7981d2"
    else if (tag == "intermediate")
        return "#ce5a5a"

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
    if (node.data.colour)
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

async function showSubGraph(nodeData) {
    const currentUrl = new URLSearchParams(window.location.search)

    const entry = await fetchTableEntry(currentUrl.get("id"))

    if (entry["type"] == "supply_chain") {
        if (!("categoryGraphId" in nodeData))
            return

        const form = new FormData()
        form.append("graph_id", nodeData["categoryGraphId"])
        const newEntry = (await getPage(0, 1, form))[0]
        const nextPage = new URLSearchParams(window.location.search)
        nextPage.delete('id')
        nextPage.append('id', newEntry["id"])
        nextPage.append('breadcrumbs', currentUrl.get("id"))
        window.location.href = "/graph?" + nextPage.toString()
        return
    }

    else if (entry["type"] == "product_category") {
        const form = new FormData()
        form.append("graph_id", nodeData["id"])
        const newEntry = (await getPage(0, 1, form))[0]
        const nextPage = new URLSearchParams(window.location.search)
        nextPage.delete('id')
        nextPage.append('id', newEntry["id"])
        nextPage.append('breadcrumbs', currentUrl.get("id"))
        window.location.href = "/graph?" + nextPage.toString()
    }

    else if (entry["type"] == "graphlet")
        return
}