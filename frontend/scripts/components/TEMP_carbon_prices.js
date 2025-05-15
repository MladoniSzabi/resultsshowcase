var rename = new Map([
    ["Antigua and Barbuda", "Antigua and Barb."],
    ["Bolivia (Plurinational State of)", "Bolivia"],
    ["Bosnia and Herzegovina", "Bosnia and Herz."],
    ["Brunei Darussalam", "Brunei"],
    ["Central African Republic", "Central African Rep."],
    ["Cook Islands", "Cook Is."],
    ["Côte d’Ivoire", "Côte d'Ivoire"],
    ["Democratic People's Republic of Korea", "North Korea"],
    ["Democratic Republic of the Congo", "Dem. Rep. Congo"],
    ["Dominican Republic", "Dominican Rep."],
    ["Eswatini", "eSwatini"],
    ["Equatorial Guinea", "Eq. Guinea"],
    ["France and Monaco", "France"],
    ["Falkland Islands", "Falkland Is."],
    ["French Polynesia", "Fr. Polynesia"],
    ["Iran (Islamic Republic of)", "Iran"],
    ["Italy, San Marino and the Holy See", "Italy"],
    ["Israel and Palestine, State of", "Israel"],
    ["Lao People's Democratic Republic", "Laos"],
    ["Marshall Islands", "Marshall Is."],
    ["Micronesia (Federated States of)", "Micronesia"],
    ["Myanmar/Burma", "Myanmar"],
    ["North Macedonia", "Macedonia"],
    ["Republic of Korea", "South Korea"],
    ["Republic of Moldova", "Moldova"],
    ["Russian Federation", "Russia"],
    ["Saint Kitts and Nevis", "St. Kitts and Nevis"],
    ["Saint Vincent and the Grenadines", "St. Vin. and Gren."],
    ["Sao Tome and Principe", "São Tomé and Principe"],
    ["Serbia and Montenegro", "Serbia"],
    ["Solomon Islands", "Solomon Is."],
    ["South Sudan", "S. Sudan"],
    ["Sudan and South Sudan", "Sudan"],
    ["Spain and Andorra", "Spain"],
    ["Swaziland", "eSwatini"],
    ["Switzerland and Liechtenstein", "Switzerland"],
    ["Syrian Arab Republic", "Syria"],
    ["Türkiye", "Turkey"],
    ["United States", "United States of America"],
    // ["Tuvalu", ?],
    ["United Republic of Tanzania", "Tanzania"],
    ["Venezuela (Bolivarian Republic of)", "Venezuela"],
    ["Viet Nam", "Vietnam"],
    ["Western Sahara", "W. Sahara"],
])

var duplicates = new Map([
    ["Israel", "Palestine"],
    ["Serbia", "Montenegro"],
    ["Somalia", "Somaliland"],
    ["Sudan", "S. Sudan"],
    ["Cyprus", "N. Cyprus"],
])

var world
var data

var extents = []

var color

const width = 928;
const marginTop = 46;
const height = width / 2 + marginTop;

var countries
var countrymesh
// Fit the projection.
const projection = d3.geoEqualEarth().fitExtent([[2, marginTop + 2], [width - 2, height]], { type: "Sphere" });
const path = d3.geoPath(projection);

// Create the SVG container.
const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 50, width, height])
    .attr("style", "max-width: 100%; height: auto;");

function createGraph() {

    // Index the values and create the color scale.
    const valuemap = new Map(data.map(d => [rename.has(d.Country) ? rename.get(d.Country) : d.Country, Number(d[1990])]));
    for (const key of duplicates.keys()) {
        valuemap.set(duplicates.get(key), valuemap.get(key))
    }

    // Append the legend.

    const legend = Legend(color, { title: "", width: 260 })
    legend.viewBox.baseVal.y = 25
    legend.viewBox.baseVal.height = 25
    d3.select("#legend-container")
        .append(() => legend)

    // Add a white sphere with a black border.
    svg.append("path")
        .datum({ type: "Sphere" })
        .attr("fill", "white")
        .attr("stroke", "currentColor")
        .attr("d", path);

    // Add a path for each country and color it according to this data.
    const g = svg.append("g")
    g.selectAll("path")
        .data(countries.features)
        .join("path")
        .attr("fill", d => color(valuemap.get(d.properties.name)))
        .attr("d", path)
        .append("title")
        .text(d => `${d.properties.name}\n${valuemap.get(d.properties.name)}`);

    // Add a white mesh.
    svg.append("path")
        .datum(countrymesh)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("d", path);

    return [svg.node(), g];
}

function mapNum(num) {
    let retval = Number(num);
    if (num === null)
        retval = Number(NaN)
    if (retval == 0) {
        console.log(retval, num)
    }
    return retval
}

var timer = null;
var g

function updateGraph(year) {
    const valuemap = new Map(data.map(d => [rename.has(d.Country) ? rename.get(d.Country) : d.Country, Number(d[year])]));
    for (const key of duplicates.keys()) {
        valuemap.set(duplicates.get(key), valuemap.get(key))
    }
    g.selectAll("path")
        .data(countries.features)
        .join("path")
        .attr("fill", d => color(valuemap.get(d.properties.name)))
        .select("title")
        .text(d => `${d.properties.name}\n${valuemap.get(d.properties.name)}`)
    document.getElementById("slider-val").innerHTML = String(year)
}

function incrementYear() {
    let target = document.getElementById("slider")
    if (target.value == 2023)
        target.value = 1990
    else {
        target.value = Number(target.value) + 1
    }
    updateGraph(target.value)
}

function play() {
    if (timer)
        return

    incrementYear()
    timer = setInterval(incrementYear, 1000)
}
function pause() {
    if (timer) {
        clearInterval(timer)
        timer = null
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    world = await (await fetch("/api/carbonprices/map")).json()
    data = await (await fetch("/api/carbonprices/data")).json()

    for (let i = 1990; i <= 2023; i++) {
        extents = extents.concat(d3.extent(data.map(d => mapNum(d[i]))));
    }

    extents = d3.extent(extents)

    color = d3.scaleSequentialLog(extents, d3.interpolateRgb("red", "#10a778"));
    countries = topojson.feature(world, world.objects.countries);
    countrymesh = topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
    let arr = createGraph(data)
    g = arr[1]
    document.getElementById("graph-container").appendChild(arr[0])
    document.getElementById("slider").value = 1990
    document.getElementById("slider").oninput = (ev) => { console.log("ASD"); updateGraph(Number(ev.target.value)) }
})