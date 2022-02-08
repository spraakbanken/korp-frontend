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

        const tokens = parseInt(corpus["info"]["Size"])
        corpus.tokens = tokens
        corpus.sentences = parseInt(corpus["info"]["Sentences"])
    }

    /* recursive function to set the structure and compute
     * - select status of folders
     * - number of (total) children for each folder
     * propbably more stuff in the future
     */
    function initFolders(folders) {
        let totalCorporaIds = []
        let totalTokens = 0
        let totalSentences = 0

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
            folder.tokens = _.reduce(folder.contents, (tokens, corpus) => tokens + corpus.tokens, 0)
            folder.sentences = _.reduce(folder.contents, (sentences, corpus) => sentences + corpus.sentences, 0)
            folder.subFolders = subFolders
            if (subFolders.length > 0) {
                const [corporaIds, tokenCount, sentenceCount] = initFolders(subFolders)
                totalCorporaIds = totalCorporaIds.concat(corporaIds)
                folder.tokens += tokenCount
                folder.sentences += sentenceCount
                folder.numberOfChildren += corporaIds.length
            }
            folder.selected = getFolderSelectStatus(folder)

            totalTokens += folder.tokens
            totalSentences += folder.sentences
        }
        return [totalCorporaIds, totalTokens, totalSentences]
    }

    const [totalCorporaIds, totalTokens, totalSentences] = initFolders(Object.values(settings.corporafolders))
    const topLevelCorpora = _.filter(settings.corpora, (corpus) => !totalCorporaIds.includes(corpus.id))
    const topLevelFolders = Object.values(settings.corporafolders)

    return {
        contents: topLevelCorpora,
        subFolders: topLevelFolders,
        tokens: _.reduce(topLevelCorpora, (tokens, corpus) => tokens + corpus.tokens, 0) + totalTokens,
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

export const getAllCorpora = (folder) => {
    function inner(node) {
        const corporaIdsInFolders = []
        for (const folder of node.subFolders) {
            corporaIdsInFolders.push(inner(folder))
        }
        const corporaIds = _.flatten(corporaIdsInFolders)
        for (const corpus of node.contents) {
            corporaIds.push(corpus.id)
        }
        return corporaIds
    }
    return inner(folder)
}

export const getAllCorporaInFolders = (lastLevel, folderOrCorpus) => {
    let outCorpora = []

    // Go down the alley to the last subfolder
    while (folderOrCorpus.includes(".")) {
        const posOfPeriod = _.indexOf(folderOrCorpus, ".")
        const leftPart = folderOrCorpus.substr(0, posOfPeriod)
        const rightPart = folderOrCorpus.substr(posOfPeriod + 1)
        if (lastLevel[leftPart]) {
            lastLevel = lastLevel[leftPart]
            folderOrCorpus = rightPart
        } else {
            break
        }
    }
    if (lastLevel[folderOrCorpus]) {
        // Folder
        // Continue to go through any subfolders
        for (const key in lastLevel[folderOrCorpus]) {
            if (!["title", "contents", "description"].includes(key)) {
                outCorpora = outCorpora.concat(getAllCorporaInFolders(lastLevel[folderOrCorpus], key))
            }
        }

        // And add the corpora in this folder level
        outCorpora = outCorpora.concat(lastLevel[folderOrCorpus]["contents"])
    } else {
        // Corpus
        outCorpora.push(folderOrCorpus)
    }
    return outCorpora
}
