document.addEventListener("DOMContentLoaded", () => {
    initiliaseFilters([
        "name",
        "product",
        "cpc-code",
        "cpc-name",
        "graph-type",
        "geography",
        "node-count",
        "depth",
    ])

    initiliaseTable([
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