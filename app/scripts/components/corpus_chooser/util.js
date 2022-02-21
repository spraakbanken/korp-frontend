/** @format */

export const initCorpusStructure = (collection, initalCorpusSelection) => {
    // first set the select status of all corpora
    for (const corpus of Object.values(collection)) {
        corpus.selected = initalCorpusSelection.includes(corpus.id)

        const tokens = parseInt(corpus["info"]["Size"])
        corpus.tokens = tokens
        corpus.sentences = parseInt(corpus["info"]["Sentences"])
        if (isNaN(corpus.sentences)) corpus.sentences = 0
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
            folder.contents = _.map(folder.contents, (corpusId) => collection[corpusId])

            const subFolders = []
            _.map(folder, (value, key) => {
                if (!["title", "description", "contents", "id"].includes(key)) {
                    // this is needed for folder identity checks in chooser
                    value.id = key
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

    // this is needed for folder identity checks in chooser
    for (const folderId of Object.keys(settings.corporafolders)) {
        settings.corporafolders[folderId].id = folderId
    }

    const [totalCorporaIds, totalTokens, totalSentences] = initFolders(Object.values(settings.corporafolders))
    const topLevelCorpora = _.filter(collection, (corpus) => !totalCorporaIds.includes(corpus.id))
    const topLevelFolders = Object.values(settings.corporafolders)

    return {
        contents: topLevelCorpora,
        subFolders: topLevelFolders,
        tokens: _.reduce(topLevelCorpora, (tokens, corpus) => tokens + corpus.tokens, 0) + totalTokens,
        isRoot: true,
    }
}

/*
 * Traverse entire tree to find list of all selected corpora
 */
export const getAllSelected = (folder) => {
    return getCorpora(folder, (corpus) => corpus.selected)
}

export const getAllCorpora = (folder) => {
    return getCorpora(folder)
}

function getCorpora(folder, corpusConstraint = () => true) {
    function inner(node) {
        const corporaFolders = []
        for (const subFolder of node.subFolders) {
            corporaFolders.push(inner(subFolder))
        }
        const corpora = _.flatten(corporaFolders)
        for (const corpus of node.contents) {
            if (corpusConstraint(corpus)) {
                corpora.push(corpus.id)
            }
        }
        return corpora
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
        if (lastLevel[folderOrCorpus].contents) {
            outCorpora = outCorpora.concat(lastLevel[folderOrCorpus]["contents"])
        }
    } else {
        // Corpus
        outCorpora.push(folderOrCorpus)
    }
    return outCorpora
}

/**
 * Traverses the tree and sets userHasAccess on every corpus.
 * figures out if a folder is limited, which it is
 * if the user does not have access to any corpora in it.
 *
 * userHasAccess differs from limitedAccess, since we might
 * want to show that a corpus is restricted AND unlock it for a user
 */
export const updateLimitedAccess = (rootNode, credentials = []) => {
    function inner(node) {
        let limitedAccess = true
        for (const folder of node.subFolders) {
            // every folder and corpora should be limited for parent folder to be limited
            const folderLimitedAccess = inner(folder)
            if (!folderLimitedAccess) {
                limitedAccess = false
            }
        }
        for (const corpus of node.contents) {
            corpus.userHasAccess = !corpus.limitedAccess || credentials.includes(corpus.id.toUpperCase())
            if (corpus.userHasAccess) {
                limitedAccess = false
            }
        }
        node.limitedAccess = limitedAccess
        return limitedAccess
    }
    return inner(rootNode)
}

/**
 * Set selected to true for every corpora in corporaIds and false to the others
 * Respect credentials
 */
export const filterCorporaOnCredentials = (collection, corporaIds, credentials) => {
    const selection = []
    for (const corpus of Object.values(collection)) {
        const corpusId = corpus.id
        corpus.selected = false
        if (corporaIds.includes(corpusId) && (!corpus.limitedAccess || credentials.includes(corpusId.toUpperCase()))) {
            corpus.selected = true
            selection.push(corpusId)
        }
    }
    return selection
}

export const recalcFolderStatus = (folder) => {
    function inner(node) {
        for (const subFolder of node.subFolders) {
            inner(subFolder)
        }
        node.selected = getFolderSelectStatus(node)
    }
    inner(folder)
}

function getFolderSelectStatus(folder) {
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
