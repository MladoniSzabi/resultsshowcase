function updateSidePanel(data) {
    if ("text" in data) {
        const sp = document.getElementById("side-panel")
        sp.innerHTML = ""
        pre = document.createElement("pre")
        pre.innerText = data["text"]
        sp.appendChild(pre)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Specify the chart’s dimensions.
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const height = 0.9 * vh;
    const width = 0.8 * vw;

    const root = d3.hierarchy(GRAPH);
    const dx = 10;
    const dy = width / (root.height + 1);

    // Define the tree layout and the shape for links.
    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    // Sort the tree and apply the layout.
    root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
    tree(root);

    // Compute the extent of the tree. Note that x and y are swapped here
    // because in the tree layout, x is the breadth, but when displayed, the
    // tree extends right rather than down.
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });


    if (!viewbox)
        viewbox = [-dy / 3, x0 - dx, width, height]

    // Create the SVG container, a layer for the links and a layer for the nodes.
    svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", viewbox)
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

    const gLink = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);

    const gNode = svg.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");

    function update(event, source) {
        const duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
        const nodes = root.descendants().reverse();
        const links = root.links();

        // Compute the new tree layout.
        tree(root);

        let left = root;
        let right = root;
        root.eachBefore(node => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
        });

        const height = right.x - left.x;

        const transition = svg.transition()
            .duration(duration)

        // Update the nodes…
        const node = gNode.selectAll("g")
            .data(nodes, d => d.id);

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .on("click", (event, d) => {
                if (d.data.text) {
                    updateSidePanel(d.data)
                }
                if (d.depth == 1) {
                    text = ""
                    for (const el of d._children) {
                        text += el.data.name + ": " + el._children.length + "\n"
                    }
                    updateSidePanel({ text })
                }
                d.children = d.children ? null : d._children;
                update(event, d);
            });

        nodeEnter.append("circle")
            .attr("r", 2.5)
            .attr("fill", d => {
                if (d.data.colour) return d.data.colour
                return d._children ? "#555" : "#999"
            })
            .attr("stroke-width", 10);

        nodeEnter.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d._children ? -6 : 6)
            .attr("text-anchor", d => d._children ? "end" : "start")
            .text(d => d.data.name)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .attr("stroke", "white")
            .attr("paint-order", "stroke");

        // Transition nodes to their new position.
        const nodeUpdate = node.merge(nodeEnter).transition(transition)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition(transition).remove()
            .attr("transform", d => `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        // Update the links…
        const link = gLink.selectAll("path")
            .data(links, d => d.target.id);

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().append("path")
            .attr("d", d => {
                const o = { x: source.x0, y: source.y0 };
                return diagonal({ source: o, target: o });
            });

        // Transition links to their new position.
        link.merge(linkEnter).transition(transition)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition(transition).remove()
            .attr("d", d => {
                const o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
            });

        // Stash the old positions for transition.
        root.eachBefore(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth > 1) {
            d.children = null
        }
    });

    update(null, root)

    let left = root;
    let right = root;
    root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
    });

    viewbox = [0, left.x, width, height]
    svg.attr("viewBox", viewbox)

    document.getElementById("svg-container").appendChild(svg.node())
    const svgNode = svg.node()
    svgNode.addEventListener("wheel", handleScroll)
    svgNode.addEventListener("mousedown", handleMouseDown)
    svgNode.addEventListener("touchmove", handleTouchMove);
    svgNode.addEventListener("touchend", handleTouchEnd)

    document.getElementById("zoom-in").addEventListener('click', handleZoomInPressed)
    document.getElementById("zoom-out").addEventListener('click', handleZoomOutPressed)

    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mousemove", handleMouseMove)
})