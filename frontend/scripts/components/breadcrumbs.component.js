var breadcrumbs = []

function goToBreadcrumb(crumb) {
    let found = false
    const breadcrumbs = document.getElementById("breadcrumbs")
    console.log(2)
    for (let i = 0; i < breadcrumbs.childNodes.length; i++) {
        if (found) {
            breadcrumbs.removeChild(breadcrumbs.childNodes[i])
            i--;
        }

        if (crumb == breadcrumbs.childNodes[i])
            found = true
    }

    breadcrumbs.innerHTML += "/"
}

function onBreadcrumbClick(ev) {
    goToBreadcrumb(ev.target)
    ev.preventDefault()
    ev.stopPropagation()

    return false
}

function popBreadcrumb() {
    const breadcrumbsContainer = document.getElementById("breadcrumbs")
    const breadcrumbs = breadcrumbsContainer.getElementsByTagName("a")
    const lastCrumb = breadcrumbs[breadcrumbs.length - 2]

    goToBreadcrumb(lastCrumb)
}

async function updateBreadcrumb(params) {
    const breadcrumbs = document.getElementById("breadcrumbs").getElementsByTagName("a")
    const lastCrumb = breadcrumbs[breadcrumbs.length - 1]
    const url = new URL(lastCrumb.href)
    for (let key in params) {
        url.searchParams.delete(key)
        url.searchParams.append(key, params[key])
    }

    lastCrumb.href = window.location.pathname + "?" + url.searchParams.toString()
}

async function initialiseBreadcrumbs(viewboxes = []) {
    const searchParamsCurrent = new URLSearchParams(window.location.search)
    const current = searchParamsCurrent.get("id")
    const breadcrumbsArray = searchParamsCurrent.getAll("breadcrumbs")
    breadcrumbsArray.push(current)

    const breadcrumbs = document.getElementById("breadcrumbs")
    breadcrumbs.innerHTML = ""

    const searchParams = new URLSearchParams()

    for (let i = 0; i < breadcrumbsArray.length; i++) {
        searchParams.delete("viewbox")
        searchParams.delete("id")
        searchParams.append("id", breadcrumbsArray[i])

        if (i < viewboxes.length && viewboxes[i])
            searchParams.append("viewbox", viewboxes[i].toString())

        const crumb = document.createElement("a")
        crumb.href = window.location.pathname + "?" + searchParams.toString()
        crumb.innerText = (await fetchTableEntry(breadcrumbsArray[i])).name
        crumb.addEventListener('click', onBreadcrumbClick)

        breadcrumbs.appendChild(crumb)
        breadcrumbs.innerHTML += "/"

        searchParams.append("breadcrumbs", breadcrumbsArray[i])
    }
}

document.addEventListener("DOMContentLoaded", initialiseBreadcrumbs)