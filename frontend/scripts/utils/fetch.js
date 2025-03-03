async function getItemCount(filters) {
    let urlParams = new URLSearchParams(filters)
    let response = await fetch(`/api/graphs/total?${urlParams.toString()}`)
    if (response.status != 200) {
        // error
    }
    let totalItems = Number(await response.text())
    return totalItems
}

async function getPage(pageNumber, itemsPerPage, filters) {
    filters.append('page', pageNumber)
    filters.append('count', itemsPerPage)
    let urlParams = new URLSearchParams(filters)
    let response = await fetch(`/api/graphs/page?${urlParams.toString()}`)
    if (response.status != 200) {
        // error
    }
    let activities = await response.json()
    return activities
}

async function fetchGraph(graphId) {

    const response = await fetch("/api/graph/" + String(graphId))
    if (response.status !== 200) {
        error()
        return null
    }

    const graph = await response.json()
    return graph
}

async function fetchTableEntry(rowId) {
    filters = new FormData()
    filters.append('id', rowId)
    filters.append('count', 1)
    let urlParams = new URLSearchParams(filters)
    let response = await fetch(`/api/graphs/page?${urlParams.toString()}`)
    if (response.status != 200) {
        // error
    }
    let activities = await response.json()
    return activities[0]
}