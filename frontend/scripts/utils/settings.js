const GraphType = {
    FDT: "fdt",
    RADIAL: "radial",
}

const GraphColouring = {
    TAG: "tag",
    LAYER: "layer",
}

function defaultValue(key, value) {
    return localStorage.getItem(key) || value
}

var settings = [
    {
        "name": "graphType",
        "displayName": "Graph Type",
        "value": defaultValue("graphType", GraphType.FDT),
        "possibleValues": [
            {
                "value": "fdt",
                "displayName": "Force Directed Graph"
            },
            {
                "value": "radial",
                "displayName": "Radial Tidy Tree"
            }
        ]
    },
    {
        "name": "graphColouring",
        "displayName": "Graph Colouring",
        "value": defaultValue("graphColouring", GraphColouring.TAG),
        "possibleValues": [
            {
                "value": GraphColouring.TAG,
                "displayName": "By Tags"
            },
            {
                "value": GraphColouring.LAYER,
                "displayName": "By Layers"
            }
        ]
    },
    {
        "name": "tidyTreeRadius",
        "displayName": "Radial Tree Radius",
        "value": defaultValue("tidyTreeRadius", 800),
        "filters": {
            "type": "number"
        },
        "condition": (settings) => { return settings.graphType == GraphType.RADIAL }
    }
]

function setSetting(name, value) {
    for (let setting of settings) {
        if (setting.name == name) {
            setting.value = value
            localStorage.setItem(setting.name, value)
        }
    }
}

function getSettings() {
    processed_settings = {}
    for (let setting of settings) {
        processed_settings[setting.name] = setting.value
    }

    return processed_settings
}

function getRawSettings() {
    return settings
}