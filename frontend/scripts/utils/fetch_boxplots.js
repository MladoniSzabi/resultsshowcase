async function getItemCount(filters) {
    let urlParams = new URLSearchParams(filters)
    let response = await fetch(`/api/boxplots/total?${urlParams.toString()}`)
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
    let response = await fetch(`/api/boxplots/page?${urlParams.toString()}`)
    if (response.status != 200) {
        // error
    }
    let activities = await response.json()
    return activities
}