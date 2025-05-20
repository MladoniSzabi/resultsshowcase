function drawLegend(container, tags) {
    container.innerHtml = ""

    for (const key in tags) {
        console.log(key)
        const p = document.createElement("p")
        const span = document.createElement("span")
        span.innerText = "⬤ "
        p.innerText = tags[key]["full_name"]
        span.style.color = tags[key]["colour"]
        p.prepend(span)

        container.append(p)
    }
}