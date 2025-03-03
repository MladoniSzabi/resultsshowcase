function updateItemsPerPage(itemsPerPage) {
    const pageSizeInput = document.getElementById("pagination-page-size")
    pageSizeInput.value = itemsPerPage
}

function updateTotalResultsDisplay(totalItems) {
    const totalItemsDisplay = document.getElementById("pagination-total-item-count")
    totalItemsDisplay.innerText = String(totalItems) + " total results"
}

function getPageCount(totalItems, itemsPerPage) {
    return Math.max(0, Math.floor((totalItems - 1) / itemsPerPage))
}

function isFirstPage(currentPage, totalPages) {
    return currentPage == 0
}

function isLastPage(currentPage, totalPages) {
    return currentPage == totalPages - 1
}

function setPage(newPage) {
    const currentUrl = new URLSearchParams(window.location.search)
    currentUrl.delete("page")
    currentUrl.append("page", newPage)

    window.location.search = currentUrl.toString()
}

function onPaginationSelect(event) {
    setPage(Number(event.target.innerText) - 1)
}

function getPaginationButtons(currentPage, totalPages) {
    pages = []
    pages.push(1)
    if (currentPage > 3) {
        pages.push(null)
    }

    for (let i = Math.max(currentPage - 2, 1); i < Math.min(currentPage + 3, totalPages - 1); i++) {
        pages.push(i + 1)
    }

    if (currentPage < totalPages - 4) {
        pages.push(null)
    }

    pages.push(totalPages)

    return pages
}

function renderPagination(isFirstPage, isLastPage, currentPage, buttons) {
    let container = document.getElementById("pagination-controls")
    container.innerHTML = ""

    if (!isFirstPage) {
        let prevArrow = document.createElement("button")
        prevArrow.textContent = "<"
        prevArrow.onclick = () => { setPage(currentPage - 1) } // TODO:
        container.appendChild(prevArrow)
    }

    for (const item of buttons) {
        if (item === null) {
            let separator = document.createElement("p")
            separator.innerText = "..."
            container.appendChild(separator)
            continue
        }
        let button = document.createElement("button")
        button.textContent = String(item)
        button.onclick = onPaginationSelect
        if (item == currentPage + 1)
            button.disabled = true
        container.appendChild(button)
    }

    if (!isLastPage) {
        let nextArrow = document.createElement("button")
        nextArrow.textContent = ">"
        nextArrow.onclick = () => { setPage(currentPage + 1) } // TODO:
        container.appendChild(nextArrow)
    }
}

function updatePagination(currentPage, totalPages) {
    renderPagination(
        isFirstPage(currentPage, totalPages),
        isLastPage(currentPage, totalPages),
        currentPage,
        getPaginationButtons(currentPage, totalPages)
    )
}

function updateNavigation(totalItems, currentPage, itemsPerPage) {
    updateItemsPerPage(itemsPerPage)
    updateTotalResultsDisplay(totalItems)
    const totalPages = getPageCount(totalItems, itemsPerPage)
    updatePagination(currentPage, totalPages)
}