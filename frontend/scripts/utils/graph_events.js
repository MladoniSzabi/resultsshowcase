var isMouseDown = false
var initialDistance = null
var initialViewbox = null
var initialPos = null
var viewbox = null
var svg = null
var historyTimeout = null

function updateHistory(viewbox) {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.delete("viewbox")
    searchParams.append("viewbox", viewbox.toString())
    clearTimeout(historyTimeout)
    historyTimeout = setTimeout(() => {
        let state = { 'graph': window.history.state.graph, 'viewboxes': window.history.state.viewboxes }
        state.viewboxes[state.viewboxes.length - 1] = viewbox
        window.history.replaceState(state, "", window.location.pathname + "?" + searchParams.toString())
        updateBreadcrumb({ "viewbox": viewbox })
    }, 200)

}

function getDistance(event) {
    // Calculate distance between two touch points
    const [touch1, touch2] = event.touches;
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
}

function handleTouchEnd(ev) {
    initialDistance = null
    initialViewbox = null
    initialPos = null
}

function handleTouchMove(ev) {
    if (ev.touches.length === 1) {
        ev.preventDefault()
        const touch = ev.touches[0]
        if (initialPos === null) {
            initialPos = { x: touch.clientX, y: touch.clientY }
            initialViewbox = viewbox
        }
        else {
            panSvg({
                x: initialPos.x - touch.clientX,
                y: initialPos.y - touch.clientY
            }, initialViewbox)
        }
    }
    if (ev.touches.length === 2) {
        ev.preventDefault();

        const distance = getDistance(ev)
        if (initialDistance === null) {
            initialDistance = distance;
            initialViewbox = viewbox
        } else {
            const zoomFactor = (initialDistance / distance);
            const [touch1, touch2] = ev.touches;
            const center = {
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2
            }

            zoomSvg(zoomFactor, center, initialViewbox)
        }
    }
}

function panSvg(distance, initialViewbox = null) {
    const svgEl = svg.node()
    const svgPos = svgEl.getBoundingClientRect()
    const svgWidth = svgPos.right - svgPos.left
    const svgHeight = svgPos.bottom - svgPos.top
    const relx = distance.x / svgWidth
    const rely = distance.y / svgHeight

    if (initialViewbox === null) {
        initialViewbox = viewbox
    }

    const newBox = [
        initialViewbox[0] + relx * initialViewbox[2],
        initialViewbox[1] + rely * initialViewbox[3],
        initialViewbox[2],
        initialViewbox[3]
    ]

    viewbox = newBox
    svg.attr("viewBox", viewbox)
    updateHistory(viewbox)
}

function zoomSvg(factor, center, oldViewbox = null) {
    const svgEl = svg.node()
    const svgPos = svgEl.getBoundingClientRect()
    const svgWidth = svgPos.right - svgPos.left
    const svgHeight = svgPos.bottom - svgPos.top
    const relx = (center.x - svgPos.left) / svgWidth
    const rely = (center.y - svgPos.top) / svgHeight

    if (oldViewbox === null) {
        oldViewbox = viewbox
    }

    if (factor > 1) {
        // zooming out
        newBox = [
            oldViewbox[0] + relx * oldViewbox[2] * (1 - factor),
            oldViewbox[1] + rely * oldViewbox[3] * (1 - factor),
            oldViewbox[2] * factor,
            oldViewbox[3] * factor
        ]
    } else {
        // zooming in
        newBox = [
            oldViewbox[0] + relx * oldViewbox[2] * (1 - factor),
            oldViewbox[1] + rely * oldViewbox[3] * (1 - factor),
            oldViewbox[2] * factor,
            oldViewbox[3] * factor
        ]
    }
    viewbox = newBox
    svg.attr("viewBox", viewbox)
    updateHistory(viewbox)
}

function handleScroll(event) {

    const SCROLL_FACTOR = 1.2

    const deltaRel = Math.sign(event.deltaY) * SCROLL_FACTOR
    const factor = deltaRel < 0 ? 1 / -deltaRel : deltaRel

    zoomSvg(factor, { x: event.clientX, y: event.clientY })

    event.preventDefault()
    event.stopPropagation()
}

function handleMouseMove(event) {
    if (isMouseDown) {
        panSvg({
            x: -event.movementX,
            y: -event.movementY
        })

        event.stopPropagation()
        event.preventDefault()
        event.cancelBubble = true
        event.returnValue = false
        return false
    }

}

function handleMouseDown(event) {
    isMouseDown = true;
    event.preventDefault()
    return false
}

function handleMouseUp(event) {
    isMouseDown = false
}

function handleZoomInPressed() {
    const svgPos = svg.node().getBoundingClientRect()
    const svgWidth = svgPos.right - svgPos.left
    const svgHeight = svgPos.bottom - svgPos.top
    zoomSvg(0.8, {
        x: svgWidth / 2,
        y: svgHeight / 2
    })
}

function handleZoomOutPressed() {
    const svgPos = svg.node().getBoundingClientRect()
    const svgWidth = svgPos.right - svgPos.left
    const svgHeight = svgPos.bottom - svgPos.top
    zoomSvg(1.2, {
        x: svgWidth / 2,
        y: svgHeight / 2
    })
}

function drag(simulation) {

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

function events_init(_svg) {
    isMouseDown = false
    initialDistance = null
    initialViewbox = null
    initialPos = null
    svg = _svg
    viewbox = svg.attr("viewBox").split(",").map((el) => Number(el))
}