function addSidePanelRow(name, value) {
    const row = document.createElement("div")

    const nameEl = document.createElement("span")
    nameEl.innerText = name + ": "
    row.appendChild(nameEl)

    const valueEl = document.createElement("span")
    valueEl.innerText = value
    row.appendChild(valueEl)

    return row
}

function updateSidePanel(graphData) {

    document.getElementById("graph-container").classList.remove("collapsed")
    document.getElementById("sidepanel-container").classList.remove("collapsed")

    const sidepanel = document.getElementById("sidepanel")
    sidepanel.innerHTML = ""

    if (graphData.name.includes(":")) {
        const cpcName = graphData.name.substring(graphData.name.indexOf(":") + 2)
        const cpcCode = graphData.name.substring(0, graphData.name.indexOf(":"))

        const title = document.createElement("h1")
        title.innerText = cpcName
        sidepanel.appendChild(title)

        const cpcCodeContainer = addSidePanelRow("CPC Code", cpcCode)
        sidepanel.appendChild(cpcCodeContainer)
    }
    else {
        const title = document.createElement("h1")
        title.innerText = graphData.name
        sidepanel.appendChild(title)
    }

    if ("product" in graphData) {
        const productContainer = addSidePanelRow("Product", graphData.product)
        sidepanel.appendChild(productContainer)
    }

    if ("cpc" in graphData) {
        const cpcName = graphData.cpc.substring(graphData.cpc.indexOf(":") + 2)
        const cpcCode = graphData.cpc.substring(0, graphData.cpc.indexOf(":"))

        const cpcCodeContainer = addSidePanelRow("CPC Code", cpcCode)
        sidepanel.appendChild(cpcCodeContainer)

        const cpcNameContainer = addSidePanelRow("CPC Name", cpcName)
        sidepanel.appendChild(cpcNameContainer)
    }

    if ("tag" in graphData) {
        const tagContainer = addSidePanelRow("Tag", graphData.tag)
        sidepanel.appendChild(tagContainer)
    }

    if ("location" in graphData) {
        const locationContainer = addSidePanelRow("Geography", graphData.location)
        sidepanel.appendChild(locationContainer)
    }
}

function onClose(ev) {
    document.getElementById("graph-container").classList.add("collapsed")
    document.getElementById("sidepanel-container").classList.add("collapsed")
}

function initialiseGraphSidePanel() {
    document.getElementById("sidepanel-close").addEventListener("click", onClose)
}

document.addEventListener("DOMContentLoaded", initialiseGraphSidePanel)