/** @format */
import _ from "lodash"
import settings from "@/settings"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { Folder } from "@/settings/config.types"
import { LangString } from "@/i18n/types"
import { locObj } from "./i18n"

export type ChooserFolder = {
    corpora: CorpusTransformed[]
    numberOfChildren: number
    tokens: number
    sentences: number
    subFolders: ChooserFolderSub[]
    limited_access?: boolean
}

export type ChooserFolderSub = ChooserFolder & {
    id: string
    title: LangString
    description?: LangString
    selected: "none" | "some" | "all"
    extended?: boolean
}

export type ChooserFolderRoot = ChooserFolder & {
    isRoot: true
}

const isRoot = (folder: ChooserFolder): folder is ChooserFolderRoot => "isRoot" in folder
const isSub = (folder: ChooserFolder): folder is ChooserFolderSub => !isRoot(folder)
export const isFolder = (object: ChooserFolder | CorpusTransformed): object is ChooserFolderSub =>
    "numberOfChildren" in object

export const initCorpusStructure = (collection: Record<string, CorpusTransformed>): ChooserFolderRoot => {
    for (const corpus of Object.values(collection)) {
        const tokens = parseInt(corpus.info.Size || "0")
        corpus.tokens = tokens
        corpus.sentences = parseInt(corpus.info.Sentences || "0")
    }

    /* recursive function to set the structure and compute
     * - select status of folders
     * - number of (total) children for each folder
     * propbably more stuff in the future
     */
    function initFolders(foldersRaw: Record<string, Folder>) {
        const ids: string[] = []
        let totalTokens = 0
        let totalSentences = 0

        const folders: ChooserFolderSub[] = _.map(foldersRaw, (folder, id) => {
            ids.push(...(folder.corpora || []))
            const corpora = _.map(folder.corpora, (corpusId) => collection[corpusId])

            // this is needed for folder identity checks in chooser
            let nCorpora = corpora.length
            let tokens = _.reduce(corpora, (tokens, corpus) => tokens + corpus.tokens!, 0)
            let sentences = _.reduce(corpora, (sentences, corpus) => sentences + corpus.sentences!, 0)
            let subFolders: ChooserFolderSub[] = []
            if (folder.subfolders) {
                const summary = initFolders(folder.subfolders)
                subFolders = summary.folders
                ids.push(...summary.ids)
                tokens += summary.tokens
                sentences += summary.sentences
                nCorpora += summary.ids.length
            }
            const selected = getFolderSelectStatus({ subFolders, corpora })

            totalTokens += tokens
            totalSentences += sentences

            return {
                id,
                title: folder.title,
                description: folder.description,
                corpora,
                numberOfChildren: nCorpora,
                tokens,
                sentences,
                subFolders,
                selected,
            } satisfies ChooserFolderSub
        })
        return {
            folders,
            ids,
            tokens: totalTokens,
            sentences: totalSentences,
        }
    }

    const { folders, ids, tokens, sentences } = initFolders(settings["folders"])
    const topLevelCorpora = _.filter(collection, (corpus) => !ids.includes(corpus.id))

    return {
        corpora: topLevelCorpora,
        subFolders: folders,
        numberOfChildren: ids.length + topLevelCorpora.length,
        tokens: _.reduce(topLevelCorpora, (tokensTop, corpus) => tokensTop + corpus.tokens!, 0) + tokens,
        sentences: sentences + topLevelCorpora.reduce((sum, corpus) => sum + corpus.sentences!, 0),
        isRoot: true,
    }
}

/**
 * Traverse entire tree to find list of all selected corpora
 */
export const getAllSelected = (folder: ChooserFolder) => {
    return getCorpora(folder, (corpus) => !!corpus.selected)
}

export const getAllCorpora = (folder: ChooserFolder): string[] => {
    return getCorpora(folder)
}

function getCorpora(
    folder: ChooserFolder,
    corpusConstraint: (corpus: CorpusTransformed) => boolean = () => true
): string[] {
    const subIds: string[] = folder.subFolders.flatMap((folder) => getCorpora(folder, corpusConstraint))
    const hereIds = folder.corpora.filter(corpusConstraint).map((corpus) => corpus.id)
    return [...subIds, ...hereIds]
}

/**
 * Given an object where the keys are folders and a string that is either a corpus identifier or a folder
 * If it is a folder, get all corpora in folder recursively, else, return the corpus identifier in a list.
 */
export const getAllCorporaInFolders = (lastLevel: Record<string, Folder>, folderOrCorpus: string): string[] => {
    let outCorpora: string[] = []

    // Go down the alley to the last subfolder
    while (folderOrCorpus.includes(".")) {
        const posOfPeriod = _.indexOf(folderOrCorpus, ".")
        const leftPart = folderOrCorpus.substring(0, posOfPeriod)
        const rightPart = folderOrCorpus.substring(posOfPeriod + 1)
        if (lastLevel[leftPart]) {
            lastLevel = lastLevel[leftPart]["subfolders"]!
            folderOrCorpus = rightPart
        } else {
            break
        }
    }
    if (lastLevel[folderOrCorpus]) {
        // Folder
        // Continue to go through any subfolders
        for (const subfolder in lastLevel[folderOrCorpus]["subfolders"]) {
            outCorpora = outCorpora.concat(getAllCorporaInFolders(lastLevel[folderOrCorpus]["subfolders"]!, subfolder))
        }

        // And add the corpora in this folder level
        if (lastLevel[folderOrCorpus].corpora) {
            outCorpora = outCorpora.concat(lastLevel[folderOrCorpus]["corpora"]!)
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
 * userHasAccess differs from limited_access, since we might
 * want to show that a corpus is restricted AND unlock it for a user
 */
export const updateLimitedAccess = (node: ChooserFolder, credentials: string[] = []): boolean => {
    let limitedAccess = true
    for (const folder of node.subFolders) {
        // every folder and corpora should be limited for parent folder to be limited
        const folderLimitedAccess = updateLimitedAccess(folder, credentials)
        if (!folderLimitedAccess) {
            limitedAccess = false
        }
    }
    for (const corpus of node.corpora) {
        corpus.userHasAccess = !corpus["limited_access"] || credentials.includes(corpus.id.toUpperCase())
        if (corpus.userHasAccess) {
            limitedAccess = false
        }
    }
    node.limited_access = limitedAccess
    return limitedAccess
}

/**
 * Set selected to true for every corpora in corporaIds and false to the others
 * Respect credentials
 */
export const filterCorporaOnCredentials = (
    collection: CorpusTransformed[],
    corporaIds: string[],
    credentials: string[]
): string[] => {
    const selection: string[] = []
    for (const corpus of collection) {
        const shouldSelect =
            corporaIds.includes(corpus.id) &&
            (!corpus["limited_access"] || credentials.includes(corpus.id.toUpperCase()))
        corpus.selected = shouldSelect
        if (shouldSelect) selection.push(corpus.id)
    }
    return selection
}

export const recalcFolderStatus = (folder: ChooserFolder): void => {
    folder.subFolders.forEach(recalcFolderStatus)
    if (isSub(folder)) folder.selected = getFolderSelectStatus(folder)
}

function getFolderSelectStatus(folder: Pick<ChooserFolderSub, "subFolders" | "corpora">): "none" | "some" | "all" {
    let selected: "none" | "some" | "all" = "none"
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

    for (const corpus of folder.corpora) {
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

/** Get token/sentence info for a corpus. */
export function getSizeInfo(corpus: CorpusTransformed): CorpusSizeInfo[] {
    const infos: CorpusSizeInfo[] = [{ lang: corpus.lang, tokens: corpus.tokens!, sentences: corpus.sentences! }]
    // For parallel corpora, include linked language
    if (corpus["linked_to"]) {
        for (const linkedCorpusId of corpus["linked_to"]) {
            const linkedCorpus = settings.corpora[linkedCorpusId]
            infos.push({
                lang: linkedCorpus.lang!,
                tokens: parseInt(linkedCorpus.info.Size!) || 0,
                sentences: parseInt(linkedCorpus.info.Sentences!) || 0,
            })
        }
    }
    return infos
}

export type CorpusSizeInfo = {
    lang?: string
    tokens: number
    sentences: number
}

/** Create data for corpus link. */
export function makeLink(corpusId: string, lang?: string): CorpusLinkInfo | undefined {
    if (!settings["corpus_info_link"]) return
    const urlTemplate = locObj(settings["corpus_info_link"]["url_template"], lang)
    const label = locObj(settings["corpus_info_link"]["label"], lang)
    if (!urlTemplate || !label) {
        console.error(`Invalid setting "corpus_info_link"`, settings["corpus_info_link"])
        return
    }
    // Parallel corpora have an id like "<main_id>-<lang>"
    const id = settings["parallel"] ? corpusId.split("-")[0] : corpusId
    const url = urlTemplate.replace("%s", id)
    return { url, label }
}

export type CorpusLinkInfo = {
    url: string
    label: string
}
