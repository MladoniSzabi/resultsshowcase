function calculateNewNodePosition(parent, index, max) {
    if (parent.parent) {
        let directionVector = {
            'x': parent.x - parent.parent.x,
            'y': parent.y - parent.parent.y
        }

        angle = Math.atan(Math.abs(directionVector.y) / Math.abs(directionVector.x))

        if (directionVector.x < 0 && directionVector.y > 0) {
            angle = Math.PI - angle
        } else if (directionVector.x < 0 && directionVector.y < 0) {
            angle = - (Math.PI - angle)
        } else if (directionVector.x > 0 && directionVector.y < 0) {
            angle = -angle
        }

        if (index != 0) {
            angle += (Math.PI * Math.min(max * 20, 200) / 180) * ((index / (max - 1)) - 0.5)
        }

        radious = 600
        return {
            'x': parent.x + radious * Math.cos(angle),
            'y': parent.y + radious * Math.sin(angle)
        }
    }

    return { 'x': 0, 'y': 0 }
}

function setIds(tree, start, depth, height) {
    if (tree == null)
        return start;

    tree['id'] = ++start
    tree['depth'] = depth++
    tree['height'] == height++
    if (!('children' in tree)) {
        return start;
    }

    const settings = getSettings()
    for (let i = 0; i < tree.children.length; i++) {
        tree.children[i]['parent'] = tree
        let pos = calculateNewNodePosition(tree, i, tree.children.length)
        tree.children[i]['x'] = pos.x
        tree.children[i]['y'] = pos.y
        tree.children[i].colour = getNodeColour(tree.children[i], tree, settings)

        start = setIds(tree.children[i], start, depth, height)
    }
    return start
}

function addSubTree(newNode, root, d) {
    let ins = d3.hierarchy(newNode);
    let ccount = root.descendants().length;
    ins.colour = d.colour
    ins.parent = d.parent
    ins.x = d.x
    ins.y = d.y
    setIds(ins, ccount, d.depth, d.height)
    for (let i = 0; i < ins.children.length; i++) {
        ins.children[i].parent = d
    }
    d.children = ins.children;
    d._children = ins.children
    d.data = newNode
}

function createFDTGraph(rootNode, viewbox = null) {

    // Specify the chart’s dimensions.
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const height = 0.9 * vh;
    const width = 0.8 * vw;

    // Compute the graph and start the force simulation.
    const root = d3.hierarchy(rootNode);
    const settings = getSettings()

    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        d.colour = getNodeColour(d, d.parent, settings)
    });

    const links = root.links();
    const nodes = root.descendants();

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(500).strength(0.1))
        .force("charge", d3.forceManyBody().strength(-800));

    if (!viewbox)
        viewbox = [-width / 2, -height / 2, width, height]

    // Create the container SVG.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", viewbox);

    const gLink = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)

    const gNode = svg.append("g")

    function update(event, source) {

        const nodes = root.descendants()
        const links = root.links();

        simulation.nodes(nodes)
        simulation.force('link').links(links)

        // Append links.
        let link = gLink
            .selectAll("line")
            .data(links, d => d.target.id)

        link.exit().remove()

        const linkEnter = link.enter().append("line")

        link = linkEnter.merge(link)

        // Append nodes.
        let node = gNode
            .selectAll("g")
            .data(nodes, d => d.id)

        node.exit().remove()

        const nodeEnter = node.enter()
            .append("g")
            .call(drag(simulation))

        nodeEnter.on('dblclick', (event, d) => { showSubGraph(d.data) })

        nodeEnter.on('click', (event, d) => { updateSidePanel(d.data) })

        // nodeEnter.on('contextmenu', (ev, d) => {
        //     if (d.data.id) {
        //         if (d.data.children || d.data._children) {
        //             ev.stopPropagation()
        //             ev.preventDefault()
        //             return false
        //         }
        //         showContextMenu(ev, (layers, agrifood_only) => {
        //             expandNode(event, d.data, layers, agrifood_only).then((newNode) => {
        //                 addSubTree(newNode, root, d)
        //                 update(event, d)
        //                 root.sort((a, b) => d3.ascending(a.data.name, b.data.name))
        //             })
        //         })

        //         return false
        //     }
        // })

        nodeEnter.append("circle")
            .attr("fill", d => d.colour)
            .attr("stroke", d => getNodeBorderColour(d, d.parent, settings))
            .attr("stroke-width", d => getNodeBorderColour(d, d.parent, settings) == "#fff" ? 0 : 3)
            .attr("r", d => getNodeSize(d))

        nodeEnter.append("text")
            .text(d => d.data.name)
            .attr("alignment-baseline", "central")
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .attr("fill", d => getNodeSize(d) < 80 ? "#000" : invertColour(d.colour, true))
            .attr("transform", d => getNodeSize(d) < 80 ? `translate(${getNodeSize(d) * 2 + 5}, 0)` : "")
            .call(wrap, 10);

        node = nodeEnter.merge(node)

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });
    }

    update(null, root);

    return svg;
}