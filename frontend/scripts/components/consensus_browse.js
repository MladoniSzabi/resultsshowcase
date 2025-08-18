document.addEventListener("DOMContentLoaded", () => {
    initialiseFilters([
        "name",
        "cpc-code",
        "cpc-name",
        "occurences"
    ])

    initialiseTable([
        "name",
        "cpc_code",
        "cpc_name",
        "occurences"
    ], (id) => { window.location.href = "/consensusgraphlets/graph?id=" + String(id) })
})