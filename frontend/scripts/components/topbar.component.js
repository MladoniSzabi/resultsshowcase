function showSettings() {
    document.getElementById("settings-modal").classList.add("show")
    renderSettigns()
}

function initiliase() {
    document.getElementById("setting-button").addEventListener("click", showSettings)
}

document.addEventListener("DOMContentLoaded", initiliase)