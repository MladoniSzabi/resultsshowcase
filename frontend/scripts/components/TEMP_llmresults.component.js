function getChildElementIndex(node) {
    return Array.prototype.indexOf.call(node.parentNode.children, node);
}

function onclick(ev) {
    const index = getChildElementIndex(ev.target)

    let col = index % 25
    let row = Math.floor(index / 25)
    if (col == 0 || row == 0)
        return

    col--;
    row--;

    const container = document.getElementById("side-panel")
    container.innerHTML = ""
    const reasons = REASONING[row][col]
    if (reasons.length == 0) {
        return
    }

    for (const el of reasons) {
        container.innerHTML += "<pre>" + el + "</pre>"
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const confustionMatrix = document.getElementById("confusion_matrix")
    for (const el of confustionMatrix.children) {
        el.addEventListener("click", onclick)

        index = getChildElementIndex(el)
        col = index % 25
        row = Math.floor(index / 25)

        if (row == 0 || col == 0) {
            el.style.backgroundColor = "rgb(253, 230, 162)"
            continue
        }
        if (Number(el.innerText) == 0) {
            el.style.backgroundColor = "rgb(232, 198, 96)"
            continue;
        }
        if (row == col) {
            el.style.backgroundColor = "#9df917"
            continue
        }
        el.style.backgroundColor = "#ff6565"
    }
})