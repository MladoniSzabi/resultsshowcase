function showSettings(ev) {
    document.getElementById("settings-modal").classList.add("show")
    renderSettigns()

    ev.stopPropagation();
}

function initiliaseTopbar() {
    document.getElementById("setting-button").addEventListener("click", showSettings)
}

document.addEventListener("DOMContentLoaded", initiliaseTopbar)