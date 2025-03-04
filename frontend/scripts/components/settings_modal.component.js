function onInputChange(ev, name) {
    const id = ev.target.id
    setSetting(name, ev.target.value);
    renderSettigns()
    document.getElementById(id).focus()
}

function renderSettigns() {
    const settings = getSettings()
    const rawSettings = getRawSettings()

    const settingsContainer = document.getElementById("settings-modal-content")
    settingsContainer.innerHTML = ""

    settingsContainer.innerHTML = `
    <span id="setting-close-button" class="material-symbols-outlined button">
        close
    </span >
    <h1>Settings</h1>`

    document.getElementById("setting-close-button").addEventListener("click", hideSettings)

    for (const setting of rawSettings) {
        if (setting.condition && setting.condition(settings) == false) {
            continue
        }

        const row = document.createElement("p")
        const label = document.createElement("label")
        const input = setting.possibleValues == null ? document.createElement("input") : document.createElement("select")
        input.type = "text"
        input.id = "settings-" + setting.name
        label.innerText = setting.displayName + ": "
        label.htmlFor = "settings-" + setting.name

        if (setting.filters) {
            for (const attribute in setting.filters)
                input[attribute] = setting.filters[attribute]
        }

        if (setting.possibleValues) {
            for (const value of setting.possibleValues) {
                const option = document.createElement("option")
                option.value = value.value
                option.innerText = value.displayName

                input.appendChild(option)
            }
        }

        input.value = setting.value
        input.addEventListener("input", (ev) => onInputChange(ev, setting.name))

        row.appendChild(label)
        row.appendChild(input)
        settingsContainer.appendChild(row)
    }
}

function hideSettings(ev) {

    const settings = document.getElementById("settings-modal")

    if (ev.target.getAttribute("id") == "setting-close-button")
        document.getElementById("settings-modal").classList.remove("show")

    if (!settings.contains(ev.target))
        document.getElementById("settings-modal").classList.remove("show")
}

function initiliaseSettings() {
    document.addEventListener("click", hideSettings)
}

document.addEventListener("DOMContentLoaded", initiliaseSettings)