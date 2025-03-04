// See graph navigation and events in utils/graph_events.js

function error() {
    const svgContainer = document.getElementById("svg-container")
    svgContainer.innerHTML = ""

    svgContainer.innerText = "There was an error fetching the graph."
}

function createGraph(graph, viewbox) {
    const settings = getSettings()

    const svgContainer = document.getElementById("svg-container")
    svgContainer.innerHTML = ""

    let svg
    if (settings.graphType == GraphType.RADIAL)
        svg = createRadialGraph(graph, viewbox)
    else
        svg = createFDTGraph(graph, viewbox)

    events_init(svg)

    const svgNode = svg.node()
    svgNode.addEventListener("wheel", handleScroll)
    svgNode.addEventListener("mousedown", handleMouseDown)
    svgNode.addEventListener("touchmove", handleTouchMove);
    svgNode.addEventListener("touchend", handleTouchEnd)

    svgContainer.appendChild(svgNode)
}

async function initialiseGraphView() {
    const searchParams = new URLSearchParams(window.location.search)

    const graph = await fetchGraph(searchParams.get("id"))

    if (window.history.state == null) {
        window.history.replaceState({ 'graph': graph, 'viewboxes': [null] }, "", window.location.href)
    } else {
        let viewboxes = window.history.state.viewboxes.slice()
        viewboxes.push(null)
        window.history.replaceState({ 'graph': graph, 'viewboxes': [null] }, "", window.location.href)
    }

    if (graph === null)
        return

    let viewbox
    if (searchParams.has("viewbox"))
        viewbox = searchParams.get("viewbox").split(",")

    createGraph(graph, viewbox)

    document.getElementById("zoom-in").addEventListener('click', handleZoomInPressed)
    document.getElementById("zoom-out").addEventListener('click', handleZoomOutPressed)

    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mousemove", handleMouseMove)
}

function onStatePopped(ev) {
    const searchParams = new URLSearchParams(window.location.search)

    let viewbox
    if (searchParams.has("viewbox"))
        viewbox = searchParams.get("viewbox").split(",")

    createGraph(ev.state.graph, viewbox)
    initialiseBreadcrumbs(ev.state.viewboxes)
}

window.addEventListener("popstate", onStatePopped)
document.addEventListener("DOMContentLoaded", initialiseGraphView)

