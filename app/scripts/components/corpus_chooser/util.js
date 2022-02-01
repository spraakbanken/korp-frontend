/** @format */
export const getFolderSelectStatus = (folder) => {
    let selected = "none"
    let nothingFound = false
    for (const subFolder of folder.subFolders) {
        if (subFolder.selected == "some") {
            selected = "some"
            nothingFound = true
            break
        } else if (subFolder.selected == "none") {
            nothingFound = true
        } else {
            selected = "some"
        }
    }

    for (const corpus of folder.contents) {
        if (corpus.selected) {
            selected = "some"
        } else {
            nothingFound = true
        }
    }

    // if all folders or corpora were selected, upgrade to "all"
    if (!nothingFound) {
        selected = selected == "some" ? "all" : selected
    }

    return selected
}

export const initCorpusStructure = (initalCorpusSelection) => {
    // first set the select status of all corpora
    for (const corpus of Object.values(settings.corpora)) {
        corpus.selected = initalCorpusSelection.includes(corpus.id)
    }

    /* recursive function to set the structure and compute
     * - select status of folders
     * - number of (total) children for each folder
     * propbably more stuff in the future
     */
    function initFolders(folders) {
        let totalCorporaIds = []
        for (const folder of folders) {
            totalCorporaIds = totalCorporaIds.concat(folder.contents)
            folder.contents = _.map(folder.contents, (corpusId) => settings.corpora[corpusId])
            const subFolders = []
            _.map(folder, (value, key) => {
                if (!["title", "description", "contents"].includes(key)) {
                    subFolders.push(value)
                }
            })
            folder.numberOfChildren = folder.contents.length
            folder.subFolders = subFolders
            if (subFolders.length > 0) {
                const corporaIds = initFolders(subFolders)
                totalCorporaIds = totalCorporaIds.concat(corporaIds)
                folder.numberOfChildren += corporaIds.length
            }
            folder.selected = getFolderSelectStatus(folder)
        }
        return totalCorporaIds
    }

    const totalCorporaIds = initFolders(Object.values(settings.corporafolders))
    return {
        contents: _.filter(settings.corpora, (corpus) => !totalCorporaIds.includes(corpus.id)),
        subFolders: Object.values(settings.corporafolders),
    }
}

/*
 * Traverse entire tree to find list of all selected corpora
 */
export const findAllSelected = (rootNode) => {
    function inner(node) {
        const selectedInFolders = []
        for (const folder of node.subFolders) {
            if (folder.selected != "none") {
                selectedInFolders.push(inner(folder))
            }
        }
        const selected = _.flatten(selectedInFolders)
        for (const corpus of node.contents) {
            if (corpus.selected) selected.push(corpus.id)
        }
        return selected
    }
    return inner(rootNode)
}

/*
 * Traverse entire tree and set selected <status>
 */
function selectAllOrNone(rootNode, status) {
    function inner(node) {
        for (const folder of node.subFolders) {
            folder.selected = status ? "all" : "none"
            inner(folder)
        }
        for (const corpus of node.contents) {
            corpus.selected = status
        }
    }
    inner(rootNode)
}

export const selectAll = (rootNode) => {
    selectAllOrNone(rootNode, true)
}

export const selectNone = (rootNode) => {
    selectAllOrNone(rootNode, false)
}
