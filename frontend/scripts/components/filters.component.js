function getFilters() {

    const name = document.getElementById("name").value
    const product = document.getElementById("product").value
    const cpcCode = document.getElementById("cpc-code").value
    const cpcName = document.getElementById("cpc-name").value
    const graphType = document.getElementById("graph-type").value
    const geography = document.getElementById("geography").value
    const nodeCount = document.getElementById("node-count").value
    const depth = document.getElementById("depth").value

    let form = new FormData()

    form.append("name", name)
    form.append("product", product)
    form.append("cpc-code", cpcCode)
    form.append("cpc-name", cpcName)
    form.append("graph-type", graphType)
    form.append("geography", geography)
    form.append("node-count", nodeCount)
    form.append("depth", depth)

    return form
}

var timeoutHandler = null

function onChange(key, value) {
    clearTimeout(timeoutHandler)


    timeoutHandler = setTimeout(() => { updateTable(); tableState.currentPage = 0; timeoutHandler = null }, 500)
}

function initiliase() {
    document.getElementById("name").addEventListener("input", (ev) => onChange("name", ev.target.value))
    document.getElementById("product").addEventListener("input", (ev) => onChange("product", ev.target.value))
    document.getElementById("cpc-code").addEventListener("input", (ev) => onChange("cpc-code", ev.target.value))
    document.getElementById("cpc-name").addEventListener("input", (ev) => onChange("cpc-name", ev.target.value))
    document.getElementById("graph-type").addEventListener("input", (ev) => onChange("graph-type", ev.target.value))
    document.getElementById("geography").addEventListener("input", (ev) => onChange("geography", ev.target.value))
    document.getElementById("node-count").addEventListener("input", (ev) => onChange("node-count", ev.target.value))
    document.getElementById("depth").addEventListener("input", (ev) => onChange("depth", ev.target.value))
}

document.addEventListener("DOMContentLoaded", initiliase)