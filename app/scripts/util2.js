function getAllCorporaInFolders(lastLevel, folderOrCorpus) {
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
        // TODO refactor, do not use $/jQuery
        $.each(lastLevel[folderOrCorpus], function (key, val) {
            if (!["title", "contents", "description"].includes(key)) {
                outCorpora = outCorpora.concat(getAllCorporaInFolders(lastLevel[folderOrCorpus], key))
            }
        })

        // And add the corpora in this folder level
        outCorpora = outCorpora.concat(lastLevel[folderOrCorpus]["contents"])
    } else {
        // Corpus
        outCorpora.push(folderOrCorpus)
    }
    return outCorpora
}    

export default {
    getAllCorporaInFolders
}