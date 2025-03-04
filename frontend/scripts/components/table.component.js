
let tableState = {
    currentPage: 0,
    itemsPerPage: 5
}

function initiliaseTable() {
    const currentUrl = new URLSearchParams(window.location.search)

    table = document.getElementById("graphs-table")
    tableState.currentPage = Number(currentUrl.get("page")) || 0
    tableState.itemsPerPage = Number(currentUrl.get("itemsPerPage")) || 5

    updateTable()
}

function renderTable(table, data, onShowClicked) {
    table.innerHTML = ""

    for (let graph of data) {
        let row = document.createElement("tr")

        let cells = {}
        for (let key in graph) {
            cells[key] = document.createElement("td")
            cells[key].textContent = String(graph[key])
        }

        row.appendChild(cells["name"])
        row.appendChild(cells["productReference"])
        row.appendChild(cells["type"])
        row.appendChild(cells["geography"])
        row.appendChild(cells["cpcCode"])
        row.appendChild(cells["cpcName"])
        row.appendChild(cells["numberOfNodes"])
        row.appendChild(cells["depth"])

        let showButton = document.createElement("a")
        showButton.textContent = "Show"
        showButton.onclick = () => {
            onShowClicked(graph["id"])
        }
        let showButtonContainer = document.createElement("td")
        showButtonContainer.appendChild(showButton)
        row.appendChild(showButtonContainer)

        table.appendChild(row)
    }
}

async function updateTable() {
    const table = document.getElementById("graphs-table")
    const filters = getFilters()
    const count = await getItemCount(filters)
    const items = await getPage(tableState.currentPage, tableState.itemsPerPage, filters)

    renderTable(table, items, (i) => { window.location.href = "/graph?id=" + String(i) })
    updateNavigation(count, tableState.currentPage, tableState.itemsPerPage)
}

document.addEventListener("DOMContentLoaded", initiliaseTable)