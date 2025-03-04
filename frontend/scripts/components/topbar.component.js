function showSettings() {
    document.getElementById("settings-modal").classList.add("show")
    renderSettigns()
}

function initiliaseTopbar() {
    document.getElementById("setting-button").addEventListener("click", showSettings)
}

document.addEventListener("DOMContentLoaded", initiliaseTopbar)