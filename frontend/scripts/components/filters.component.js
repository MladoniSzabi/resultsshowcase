let filterColumns = []

function getSortedColumn() {
    const rows = document.getElementsByTagName("tr")

    for (let i = 0; i < rows[0].children.length - 1; i++) {
        if (rows[0].children[i].classList.contains("sorted")) {
            console.log(rows[1].children[i].id, rows[1].children[i])
            if (rows[0].children[i].classList.contains("descending"))
                return [rows[1].children[i].children[0].id, "descending"]
            return [rows[1].children[i].children[0].id, "ascending"]
        }
    }
}

function getFilters() {

    filters = {}
    for (const col of filterColumns) {
        filters[col] = document.getElementById(col).value
    }

    let form = new FormData()

    for (const col of filterColumns) {
        form.append(col, filters[col])
    }

    sorting = getSortedColumn()
    if (sorting) {
        [sortBy, order] = sorting
        form.append("sort-by", sortBy)
        form.append("sort-order", order)
    }

    return form
}

var timeoutHandler = null

function onSort(ev) {
    if (ev.target.classList.contains("sorted"))
        ev.target.classList.toggle("descending")
    else {
        const rows = document.getElementsByTagName("tr")
        for (let i = 0; i < rows[0].children.length - 1; i++)
            rows[0].children[i].classList.remove("sorted")
        ev.target.classList.add("sorted")
    }

    tableState.currentPage = 0;
    updateTable()
}

function onChange(key, value) {
    clearTimeout(timeoutHandler)
    timeoutHandler = setTimeout(() => { tableState.currentPage = 0; updateTable(); timeoutHandler = null }, 700)
}

function initiliaseFilters(columns) {
    filterColumns = columns

    for (const col of filterColumns) {
        document.getElementById(col).addEventListener("input", (ev) => onChange(col, ev.target.value))
    }

    const rows = document.getElementsByTagName("tr")
    for (let i = 0; i < rows[0].children.length - 1; i++)
        rows[0].children[i].addEventListener("click", onSort)

    getSortedColumn()
}