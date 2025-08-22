document.addEventListener("DOMContentLoaded", () => {
    initialiseFilters([
        "name",
    ])

    initialiseTable([
        "name",
    ], (id) => { window.location.href = "/boxplots/graph?id=" + String(id) })
})