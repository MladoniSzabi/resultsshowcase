const MW_TO_COLOR = {
    'A': '#dfdc67',
    'B': '#f6dc8a',
    'C': '#97d2d4',
    'D': '#247130',
    'E': '#d3aad1',
    'F': '#66771e',
    'G': '#fbc07f',
    'H': '#a0ca79',
    'J': '#ddbda3',
    'M': '#eda4a7',
    'O': '#9dcbec',
    'P': '#b75006',
    'Q': '#064e91',
    'S': '#792c74',
    'W': '#9c2726',
    'Z': '#026879',
}

const MW_TO_TEXT = {
    'A': "Cereals and cereal products",
    'B': "Milk and milk products",
    'C': "Eggs",
    'D': "Vegetables",
    'E': "Water",
    'F': "Fruit",
    'G': "Nuts and seeds",
    'H': "Herbs and spices",
    'J': "Fish and fish products",
    'M': "Meat and meat products",
    'O': "Fats and oils",
    'P': "Beverages",
    'Q': "Alcoholic beverages",
    'S': "Sugars, preserves and snacks",
    'W': "Soups, sauces and miscellaneous foods",
    'Z': "Supplements",
}

var selected_categories = {
    'A': true,
    'B': true,
    'C': true,
    'D': true,
    'E': true,
    'F': true,
    'G': true,
    'H': true,
    'J': true,
    'M': true,
    'O': true,
    'P': true,
    'Q': true,
    'S': true,
    'W': true,
    'Z': true,
}

var selectedFrequency = []

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

function wrap(text) {
    text.each(function () {
        let textNode = d3.select(this),
            fontSizeText = textNode.attr("font-size"),
            fullText = textNode.text(),
            word,
            line = [],
            lineHeight = 1.2, // ems
            dy = parseFloat(textNode.attr("dy") || 0),
            lines = [],
            x = parseFloat(textNode.attr("x") || 0),
            width = parseInt(textNode.attr("data-linelength"))
        textNode.text(null).attr("x", 0).attr("y", 0)

        fontSize = ""
        unit = ""
        for (const x of fontSizeText) {
            if ("1234567890".includes(x))
                fontSize += x
            else
                unit += x
        }
        fontSize = Number(fontSize)

        if (fullText.length > 40) {
            fontSize -= 2
        }
        if (fullText.length > 30) {
            fontSize -= 2
        }

        textNode.attr("font-size", String(fontSize) + unit)

        wordsplit = fullText.split(",")
        if (wordsplit.length > 1) {
            fullText = wordsplit[0] + " " + fullText.split(" ").at(-1)
        } else {
            fullText = wordsplit[0]
        }
        lines = wrapString(fullText, width)

        for (let i = 0; i < lines.length; i += 1) {
            textNode.append("tspan").attr('x', x).attr("dy", `${i == 0 ? (0.31 + dy - (lines.length - 1) / 2 * lineHeight) : lineHeight}em`).text(lines[i])
        }
    })
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
        toInput.max = max
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
    if (minFrequency == maxFrequency) {
        return 35 / 2
    }
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

    // Add a line for each link, and a circle for each node.
    const gLink = svg.append("g")
    const gNode = svg.append("g")

    function update(filteredData) {

        const filteredLinks = links.filter(e => filteredData.links[e.numericalId])
        const filteredNodes = nodes.filter(e => filteredData.nodes[e.numericalId])

        simulation.nodes(filteredNodes)
        simulation.force('link').links(filteredLinks)

        let link = gLink.selectAll("path")
            .data(filteredLinks, link => link.source + "__" + link.target)

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
            .data(filteredNodes, d => d.id)

        node.exit().remove()
        const nodeEnter = node.enter()
            .append("g")

        nodeEnter.attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .append("circle")
            .attr("r", d => getNodeSize(d.frequency, minFrequency, maxFrequency))
            .attr("fill", d => MW_TO_COLOR[d.category]);

        nodeEnter.append("text")
            .attr("alignment-baseline", "central")
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("stroke", "none")
            .attr("font-size", "12px")
            .attr("data-linelength", 15)
            .text(d => d.id)
            .call(wrap)

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

        for (let i = 0; i < 5; i++) {
            simulation.tick()
        }

        return svg.node()
    }

    update({ nodes: Array(data.nodes.length).fill(true), links: Array(data.links.length).fill(true) })

    return [svg.node(), update]
}

function setForcesStrengths(forces, strength) {
    forces['link'].strength(strength['link'])
    forces['charge'].strength(strength['charge'])
    forces['x'].strength(strength['x'])
    forces['y'].strength(strength['y'])
}

function filterNodes(graph, minFrequency, maxFrequency) {
    const nodes = Array(graph.nodes.length).fill(false)
    for (const node of graph.nodes) {
        if (node.frequency >= minFrequency && node.frequency <= maxFrequency && selected_categories[node.category])
            nodes[node.numericalId] = true
    }
    return nodes
}

function onFilterChange(minFrequency, maxFrequency, graph, container, update) {

    selectedFrequency = [minFrequency, maxFrequency]
    const filteredNodes = filterNodes(graph, minFrequency, maxFrequency)

    const filteredEdges = Array(graph.links.length).fill(false)
    for (const link of graph.links) {
        if (filteredNodes[link.sourceIndex] && filteredNodes[link.targetIndex])
            filteredEdges[link.numericalId] = true
    }

    if (filteredNodes.filter(m => m).length > 100) {
        container.innerHTML = ""
        return
    }

    const svg = update({ nodes: filteredNodes, links: filteredEdges })
    if (container.innerHTML == "") {
        container.appendChild(svg)
    }
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

const svgContainer = document.getElementById("svg-container")

const fromSlider = document.querySelector('#fromSlider');
const toSlider = document.querySelector('#toSlider');
const fromInput = document.querySelector('#fromInput');
const toInput = document.querySelector('#toInput');

const foodGroupSlider = document.querySelector("#food-cluster-slider")
const foodGroupInput = document.querySelector("#food-cluster-input")

initSliders(fromSlider, toSlider, fromInput, toInput, 0, 5, 0, 5, () => { })

let previousWindowResizeFunction = null

function fetchAndDrawGraph(graphId) {
    function callback(graph) {
        svgContainer.innerHTML = ""
        const [minFrequency, maxFrequency] = getFrequencyRange(graph["nodes"])
        const [svg, update] = drawSvg(graph, minFrequency, maxFrequency)
        initSliders(fromSlider, toSlider, fromInput, toInput, minFrequency, maxFrequency, minFrequency, maxFrequency, (min, max) => onFilterChange(min, max, graph, svgContainer, update))
        selectedFrequency = [minFrequency, maxFrequency]

        const createNodeSizeLegend = () => {
            const container = document.getElementById("node-size-labels")
            container.innerHTML = ""

            const svgs = document.getElementsByTagName("svg")
            if (svgs.length == 0)
                return

            const svgRect = svgs[0].getBoundingClientRect()
            const ratioX = svgRect.width / svgs[0].width.baseVal.value
            const ratioY = svgRect.height / svgs[0].height.baseVal.value

            const ratio = Math.min(ratioX, ratioY) * 2

            const minNodeSize = getNodeSize(minFrequency, minFrequency, maxFrequency)
            const midNodeSize = getNodeSize(Math.floor((minFrequency + maxFrequency) / 2), minFrequency, maxFrequency)
            const maxNodeSize = getNodeSize(maxFrequency, minFrequency, maxFrequency)

            function addLegendRow(nodeSize, frequency, container) {
                const node = document.createElement("div")
                node.style.backgroundColor = "#888"
                node.style.borderRadius = "100%"
                node.style.width = nodeSize + "px"
                node.style.height = nodeSize + "px"
                // const nodeContainer = document.createElement("div")
                // nodeContainer.appendChild(node)
                container.appendChild(node)
                const nodeText = document.createElement("span")
                nodeText.innerText = String(frequency) + " occurences"
                container.appendChild(nodeText)
            }

            addLegendRow(minNodeSize * ratio, minFrequency, container)

            if (minFrequency == maxFrequency) {
                return
            }

            if (minFrequency + 1 < maxFrequency) {
                addLegendRow(midNodeSize * ratio, Math.floor((minFrequency + maxFrequency) / 2), container)
            }

            addLegendRow(maxNodeSize * ratio, maxFrequency, container)
        }

        window.removeEventListener('resize', previousWindowResizeFunction)
        previousWindowResizeFunction = createNodeSizeLegend
        window.addEventListener('resize', createNodeSizeLegend)

        const checkboxes = document.getElementById("category-selector").getElementsByTagName("input")
        for (const box of checkboxes) {
            selected_categories[box.dataset.category] = box.checked
            box.onchange = (ev) => {
                selected_categories[ev.target.dataset.category] = ev.target.checked
                onFilterChange(selectedFrequency[0], selectedFrequency[1], graph, svgContainer, update)
            }
        }

        if (graph.nodes.length <= 100)
            svgContainer.appendChild(svg)

        createNodeSizeLegend()
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

const labelContainer = document.getElementById("category-labels")

for (const key in MW_TO_TEXT) {
    const el = document.createElement("p")
    el.innerHTML = "<span style='color:" + MW_TO_COLOR[key] + "' >⬤</span>" + MW_TO_TEXT[key]
    labelContainer.appendChild(el)
}

fetchAndDrawGraph(-1)