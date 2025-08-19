
let tableState = {
    currentPage: 0,
    itemsPerPage: 5,
    callback: () => { },
    columns: []
}

function initialiseTable(columns, callback) {
    tableState.columns = columns
    tableState.callback = callback
    const currentUrl = new URLSearchParams(window.location.search)

    table = document.getElementById("graphs-table")
    tableState.currentPage = Number(currentUrl.get("page")) || 0
    tableState.itemsPerPage = Number(currentUrl.get("itemsPerPage")) || 5

    document.getElementById("pagination-page-size").addEventListener("change", (ev) => {
        tableState.itemsPerPage = Number(ev.target.value)
        updateTable();
    })

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

        for (const col of tableState.columns) {
            row.appendChild(cells[col])
        }

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

    renderTable(table, items, tableState.callback)
    updateNavigation(count, tableState.currentPage, tableState.itemsPerPage)
}