document.addEventListener("DOMContentLoaded", () => {
    initialiseTable([
        "dietary_pattern",
        "food_cluster"
    ], (id) => { window.location.href = "/consensusgraphlets/graph?id=" + String(id) })
})