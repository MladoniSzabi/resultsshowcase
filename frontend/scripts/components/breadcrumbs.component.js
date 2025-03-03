async function updateBreadcrumbs(breadcrumbsArray) {

    const breadcrumbs = document.getElementById("breadcrumbs")
    breadcrumbs.innerHTML = ""

    const searchParams = new URLSearchParams()

    for (let i = 0; i < breadcrumbsArray.length; i++) {
        searchParams.delete("id")
        searchParams.append("id", breadcrumbsArray[i])

        const crumb = document.createElement("a")
        crumb.href = window.location.pathname + "?" + searchParams.toString()
        crumb.innerText = (await fetchTableEntry(breadcrumbsArray[i])).name

        breadcrumbs.appendChild(crumb)
        breadcrumbs.innerHTML += "/"

        searchParams.append("breadcrumbs", breadcrumbsArray[i])
    }
}

function initialise() {
    const searchParams = new URLSearchParams(window.location.search)
    const current = searchParams.get("id")
    const breadcrumbsArray = searchParams.getAll("breadcrumbs")
    breadcrumbsArray.push(current)

    updateBreadcrumbs(breadcrumbsArray)
}

document.addEventListener("DOMContentLoaded", initialise)