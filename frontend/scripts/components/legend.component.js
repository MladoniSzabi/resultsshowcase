function drawLegend(container, tags) {
    container.innerHTML = ""

    existingKeys = new Set();

    for (const key in tags) {
        if (existingKeys.has(tags[key]["full_name"])) {
            continue
        }
        existingKeys.add(tags[key]["full_name"])
        const p = document.createElement("p")
        const span = document.createElement("span")
        span.innerText = "⬤ "
        p.innerText = tags[key]["full_name"]
        span.style.color = tags[key]["colour"]
        p.prepend(span)

        container.append(p)
    }
}