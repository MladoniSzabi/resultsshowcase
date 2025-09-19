const MW_TO_ID = {
    'A': 1,
    'B': 2,
    'C': 3,
    'D': 4,
    'E': 5,
    'F': 6,
    'G': 7,
    'H': 8,
    'J': 9,
    'M': 10,
    'O': 11,
    'P': 12,
    'Q': 13,
    'S': 14,
    'W': 15,
    'Z': 16
}

function initSliders(fromSlider, toSlider, fromInput, toInput, min, max, currentMin, currentMax, onChange) {

    function controlFromInput(fromSlider, fromInput, toInput, controlSlider) {
        const [from, to] = getParsed(fromInput, toInput);
        if (toInput)
            fillSlider(fromInput, toInput, '#C6C6C6', '#25daa5', controlSlider);
        if (from > to) {
            fromSlider.value = to;
            fromInput.value = to;
        } else {
            fromSlider.value = from;
        }

        onChange(from, to)
    }

    function controlToInput(toSlider, fromInput, toInput, controlSlider) {
        const [from, to] = getParsed(fromInput, toInput);
        fillSlider(fromInput, toInput, '#C6C6C6', '#25daa5', controlSlider);
        setToggleAccessible(toInput, toSlider);
        if (from <= to) {
            toSlider.value = to;
            toInput.value = to;
        } else {
            toInput.value = from;
        }
        onChange(from, to)
    }

    function controlFromSlider(fromSlider, toSlider, fromInput) {
        const [from, to] = getParsed(fromSlider, toSlider);
        if (toSlider)
            fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
        if (from > to) {
            fromSlider.value = to;
            fromInput.value = to;
        } else {
            fromInput.value = from;
        }
        onChange(from, to)
    }

    function controlToSlider(fromSlider, toSlider, toInput) {
        const [from, to] = getParsed(fromSlider, toSlider);
        fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
        setToggleAccessible(toSlider, toSlider);
        if (from <= to) {
            toSlider.value = to;
            toInput.value = to;
        } else {
            toInput.value = from;
            toSlider.value = from;
        }
        onChange(from, to)
    }

    function getParsed(currentFrom, currentTo) {
        const from = parseInt(currentFrom.value, 10);
        if (currentTo) {
            const to = parseInt(currentTo.value, 10);
            return [from, to];
        }
        return [from, Infinity];
    }

    function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
        const rangeDistance = to.max - to.min;
        const fromPosition = from.value - to.min;
        const toPosition = to.value - to.min;
        controlSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition) / (rangeDistance) * 100}%,
      ${rangeColor} ${((fromPosition) / (rangeDistance)) * 100}%,
      ${rangeColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
    }

    function setToggleAccessible(currentTarget, toSlider) {
        if (Number(currentTarget.value) <= 0) {
            toSlider.style.zIndex = 2;
        } else {
            toSlider.style.zIndex = 0;
        }
    }

    fromSlider.value = currentMin
    fromInput.value = currentMin
    if (toSlider) {
        toSlider.value = currentMax
        toSlider.value = currentMax
    }

    fromSlider.min = min
    fromSlider.max = max
    fromSlider.value = min
    fromInput.min = min
    fromInput.max = max
    fromInput.value = min
    if (toSlider) {
        toSlider.min = min
        toSlider.max = max
        toSlider.value = max
        toInput.min = min
        toInput.nax = max
        toInput.value = max
    }

    if (toSlider) {
        fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
        setToggleAccessible(toSlider, toSlider);
        toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toInput);
        toInput.oninput = () => controlToInput(toSlider, fromInput, toInput, toSlider)
    }

    fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromInput);
    fromInput.oninput = () => controlFromInput(fromSlider, fromInput, toInput, toSlider);
}

function getNodeSize(frequency, minFrequency, maxFrequency) {
    return (frequency - minFrequency) / (maxFrequency - minFrequency) * 30 + 5
}

function drawSvg(data, minFrequency, maxFrequency) {
    // Specify the dimensions of the chart.
    const width = 928;
    const height = 680;

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    const linkForce = d3.forceLink(links)
    linkForce.id(d => d.id).distance(100).strength(0)
    const manyBodyForce = d3.forceManyBody()
    manyBodyForce.distanceMax(100).strength(-2000)
    const xForce = d3.forceX()
    const yForce = d3.forceY()


    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", linkForce)
        .force("charge", manyBodyForce)
        .force("x", xForce)
        .force("y", yForce);


    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Add a line for each link, and a circle for each node.
    const gLink = svg.append("g")
    const gNode = svg.append("g")

    function update(data) {
        const links = data.links.map(d => ({ ...d }));
        const nodes = data.nodes.map(d => ({ ...d }));

        simulation.nodes(nodes)
        simulation.force('link').links(links)

        let link = gLink.selectAll("path")
            .data(links, link => link.source + "__" + link.target)

        link.exit().remove()
        const linkEnter = link.enter()
            .append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("fill", "none")
            .append("path")
            .attr("d", d => Math.abs(d.source.x - d.target.x) >= (d.source.y - d.target.y) ? d3.linkHorizontal()(d) : d3.linkVertical()(d))
            .attr("stroke-width", d => Math.sqrt(d.value));

        link = linkEnter.merge(link)

        let node = gNode.selectAll("g")
            .data(nodes, d => d.id)

        node.exit().remove()
        const nodeEnter = node.enter()
            .append("g", d => { console.log("Entering node ", d.id) })

        nodeEnter.attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .append("circle")
            .attr("r", d => getNodeSize(d.frequency, minFrequency, maxFrequency))
            .attr("fill", d => color(MW_TO_ID[d.category]));

        nodeEnter.append("text")
            .attr("alignment-baseline", "central")
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("stroke", "none")
            .attr("font-size", "12px")
            .text(d => d.id)

        node = nodeEnter.merge(node)

        // Add a drag behavior.
        node.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        // Set the position attributes of links and nodes each time the simulation ticks.
        simulation.on("tick", () => {
            // nodes[0]['x'] = 0
            // nodes[0]['y'] = 0
            // link.attr("d", d => Math.abs(d.source.x - d.target.x) >= Math.abs(d.source.y - d.target.y) ? d3.linkHorizontal().x(d => d.x).y(d => d.y) : d3.linkVertical().x(d => d.x).y(d => d.y))
            link.attr("d", (...args) => Math.abs(args[0].source.x - args[0].target.x) >= (args[0].source.y - args[0].target.y) ? d3.linkHorizontal().x(d => d.x).y(d => d.y)(...args) : d3.linkVertical().x(d => d.x).y(d => d.y)(...args))
            // link.attr("d", d3.linkHorizontal()
            //     .x(d => d.x)
            //     .y(d => d.y));

            node.attr("transform", d => `translate(${d.x}, ${d.y})`)
        });

        // Reheat the simulation when drag starts, and fix the subject position.
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        // Update the subject (dragged node) position during drag.
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        // Restore the target alpha so the simulation cools after dragging ends.
        // Unfix the subject position now that it’s no longer being dragged.
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
    }

    update(data)

    return [svg.node(), update]
}

function setForcesStrengths(forces, strength) {
    forces['link'].strength(strength['link'])
    forces['charge'].strength(strength['charge'])
    forces['x'].strength(strength['x'])
    forces['y'].strength(strength['y'])
}

function filterNodes(graph, minFrequency, maxFrequency) {
    const nodes = []
    for (const node of graph["nodes"]) {
        if (node.frequency >= minFrequency && node.frequency <= maxFrequency)
            nodes.push(node)
    }
    return nodes
}

function onFrequencySlidersChange(minFrequency, maxFrequency, graph, update) {
    const filteredNodes = filterNodes(graph, minFrequency, maxFrequency)
    const filteredNodesIds = new Set(filteredNodes.map((el) => el.id))

    const filteredEdges = []
    for (const link of graph["links"]) {
        if (filteredNodesIds.has(link.source) && filteredNodesIds.has(link.target))
            filteredEdges.push(link)
    }

    update({ nodes: filteredNodes, links: filteredEdges })
}

const graphData = {
    "-1": null,
    "0": null,
    "1": null,
    "2": null,
    "3": null,
    "4": null,
    "5": null,
    "6": null,
    "7": null,
    "8": null,
    "9": null,
    "10": null,
    "11": null,
    "12": null,
    "13": null,
    "14": null,
    "15": null,
    "16": null,
    "17": null,
    "18": null
}

function getFrequencyRange(nodes) {
    let min = Infinity
    let max = -1
    for (const node of nodes) {
        min = Math.min(min, node["frequency"])
        max = Math.max(max, node["frequency"])
    }

    return [min, max]
}

const svg_container = document.getElementById("svg-container")

const fromSlider = document.querySelector('#fromSlider');
const toSlider = document.querySelector('#toSlider');
const fromInput = document.querySelector('#fromInput');
const toInput = document.querySelector('#toInput');

const foodGroupSlider = document.querySelector("#food-cluster-slider")
const foodGroupInput = document.querySelector("#food-cluster-input")

initSliders(fromSlider, toSlider, fromInput, toInput, 0, 5, 0, 5, () => { })

function fetchAndDrawGraph(graphId) {
    function callback(graph) {
        svg_container.innerHTML = ""
        const [minFrequency, maxFrequency] = getFrequencyRange(graph["nodes"])
        const [svg, update] = drawSvg(graph, minFrequency, maxFrequency)
        initSliders(fromSlider, toSlider, fromInput, toInput, minFrequency, maxFrequency, minFrequency, maxFrequency, (min, max) => onFrequencySlidersChange(min, max, graph, update))
        if (graph == -1)
            return

        svg_container.appendChild(svg)
    }

    if (graphData[graphId] != null)
        callback(graphData[graphId])
    else
        fetch("/diets/foodclusters/data/" + String(graphId)).then((data) => data.json()).then((graph) => {
            graphData[graphId] = graph
            callback(graph)
        })
}
initSliders(foodGroupSlider, null, foodGroupInput, null, -1, 18, -1, null, fetchAndDrawGraph)

