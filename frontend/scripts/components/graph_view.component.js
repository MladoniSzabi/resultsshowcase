// See graph navigation and events in utils/graph_events.js

function error() {
    const svgContainer = document.getElementById("svg-container")
    svgContainer.innerHTML = ""

    svgContainer.innerText = "There was an error fetching the graph."
}

function createGraph(graph) {
    const settings = getSettings()

    const svgContainer = document.getElementById("svg-container")
    svgContainer.innerHTML = ""

    let svg
    console.log(settings.graphType, GraphType.RADIAL, GraphType.RADIAL == settings.graphType)
    if (settings.graphType == GraphType.RADIAL)
        svg = createRadialGraph(graph)
    else
        svg = createFDTGraph(graph)

    events_init(svg)

    const svgNode = svg.node()
    svgNode.addEventListener("wheel", handleScroll)
    svgNode.addEventListener("mousedown", handleMouseDown)
    svgNode.addEventListener("touchmove", handleTouchMove);
    svgNode.addEventListener("touchend", handleTouchEnd)

    svgContainer.appendChild(svgNode)
}

async function init() {
    const searchParams = new URLSearchParams(window.location.search)
    const graph = await fetchGraph(searchParams.get("id"))
    if (graph === null)
        return

    createGraph(graph)

    document.getElementById("zoom-in").addEventListener('click', handleZoomInPressed)
    document.getElementById("zoom-out").addEventListener('click', handleZoomOutPressed)

    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mousemove", handleMouseMove)
}

document.addEventListener("DOMContentLoaded", init)

