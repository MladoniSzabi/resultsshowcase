document.addEventListener("DOMContentLoaded", () => {
    initialiseFilters([
        "name",
        "product",
        "cpc-code",
        "cpc-name",
        "graph-type",
        "geography",
        "node-count",
        "depth",
    ])

    initialiseTable([
        "name",
        "productReference",
        "type",
        "geography",
        "cpcCode",
        "cpcName",
        "numberOfNodes",
        "depth",
    ], (i) => { window.location.href = "/graph?id=" + String(i) })
})