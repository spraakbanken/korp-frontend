/** @format */
import _ from "lodash"
import memoize from "lodash/memoize"
import settings, { setDefaultConfigValues } from "@/settings"
import currentMode from "@/mode"
import timeProxyFactory from "@/backend/time-proxy"
import * as treeUtil from "./components/corpus_chooser/util"
import { CorpusListing } from "./corpus_listing"
import { ParallelCorpusListing } from "./parallel/corpus_listing"
import { httpConfAddMethodFetch } from "@/util"
import { Labeled, LangLocMap, LocMap } from "./i18n/types"
import { CorpusInfoResponse } from "./settings/corpus-info.types"
import { Config } from "./settings/config.types"
import { ConfigTransformed } from "./settings/config-transformed.types"

// Using memoize, this will only fetch once and then return the same promise when called again.
// TODO it would be better only to load additional languages when there is a language change
export const initLocales = memoize(async () => {
    const locData: LangLocMap = {}
    const defs: Promise<void>[] = []
    for (const langObj of settings.languages) {
        const lang = langObj.value
        locData[lang] = {}
        for (const pkg of ["locale", "corpora"]) {
            const file = `translations/${pkg}-${lang}.json`
            const def = fetch(file)
                .then(async (response) => {
                    if (response.status >= 300) throw new Error()
                    const data = (await response.json()) as LocMap
                    Object.assign(locData[lang], data)
                })
                .catch(() => {
                    console.log("No language file: ", file)
                })
            defs.push(def)
        }
    }

    await Promise.all(defs)
    return locData
})

async function getInfoData(): Promise<void> {
    const params = {
        corpus: _.map(settings.corpusListing.corpora, "id")
            .map((a) => a.toUpperCase())
            .join(","),
    }
    const { url, request } = httpConfAddMethodFetch(settings.korp_backend_url + "/corpus_info", params)

    const response = await fetch(url, request)
    const data = (await response.json()) as CorpusInfoResponse

    for (let corpus of settings.corpusListing.corpora) {
        corpus.info = data.corpora[corpus.id.toUpperCase()].info
        const privateStructAttrs: string[] = []
        for (let attr of data["corpora"][corpus.id.toUpperCase()].attrs.s) {
            if (attr.indexOf("__") !== -1) {
                privateStructAttrs.push(attr)
            }
        }
        corpus.private_struct_attributes = privateStructAttrs
    }
}

async function getTimeData(): Promise<[[number, number][], number]> {
    const timeProxy = timeProxyFactory.create()
    const args = await timeProxy.makeRequest()

    let [dataByCorpus, all_timestruct, rest] = args

    if (all_timestruct.length == 0) {
        return [[], 0]
    }

    // this adds data to the corpora in settings
    for (let corpus in dataByCorpus) {
        let struct = dataByCorpus[corpus]
        if (corpus !== "time") {
            const cor = settings.corpora[corpus.toLowerCase()]
            timeProxy.expandTimeStruct(struct)
            cor.non_time = struct[""]
            struct = _.omit(struct, "")
            cor.time = struct
            if (_.keys(struct).length > 1) {
                if (cor.common_attributes == null) {
                    cor.common_attributes = {}
                }
                cor.common_attributes.date_interval = true
            }
        }
    }
    return [all_timestruct, rest]
}

async function getConfig(): Promise<Config> {
    // Load static corpus config if it exists.
    try {
        const corpusConfig = require(`modes/${currentMode}_corpus_config.json`) as Config
        console.log(`Using static corpus config`)
        return corpusConfig
    } catch {}

    let configUrl: string
    // The corpora to include can be defined elsewhere can in a mode
    if (settings.corpus_config_url) {
        configUrl = await settings.corpus_config_url()
    } else {
        const labParam = process.env.ENVIRONMENT == "staging" ? "&include_lab" : ""
        configUrl = `${settings.korp_backend_url}/corpus_config?mode=${currentMode}${labParam}`
    }
    let response: Response
    try {
        response = await fetch(configUrl)
    } catch (error) {
        throw Error("Config request failed")
    }

    if (!response.ok) {
        console.error("Something wrong with corpus config", response.statusText)
        throw Error("Something wrong with corpus config")
    }

    return (await response.json()) as Config
}

/**
 * Transform the raw config fetched form backend, to a structure that frontend code can handle.
 *
 * TODO: Use the `Config` and `ConfigTransformed` types, not `any`.
 *
 * @see ./settings/README.md
 */
function transformConfig(modeSettings: any): ConfigTransformed {
    // only if the current mode is parallel, we load the special code required
    if (modeSettings.parallel) {
        require("./parallel/corpus_listing")
        require("./parallel/stats_proxy")
    }

    function rename<T extends {}>(obj: T, from: keyof T, to: keyof T): void {
        if (obj[from]) {
            obj[to] = obj[from]
            delete obj[from]
        }
    }

    rename(modeSettings.attributes, "pos_attributes", "attributes")

    // take the backend configuration format for attributes and expand it
    // TODO the internal representation should be changed to a new, more compact one.
    for (const corpusId in modeSettings.corpora) {
        const corpus = modeSettings.corpora[corpusId]

        if (corpus.title == undefined) {
            corpus.title = corpusId
        }

        rename(corpus, "pos_attributes", "attributes")
        for (const attrType of ["attributes", "struct_attributes", "custom_attributes"]) {
            const attrList = corpus[attrType]
            const attrs = {}
            const newAttrList = []
            for (const attrIdx in attrList) {
                const attr = modeSettings.attributes[attrType][attrList[attrIdx]]
                attrs[attr.name] = attr
                newAttrList.push(attr.name)
            }
            // attrs is an object of attribute settings
            corpus[attrType] = attrs
            // attrList is an ordered list of the preferred order of attributes
            corpus[`_${attrType}_order`] = newAttrList
        }
        // TODO use the new format instead
        // remake the new format of witihns and contex to the old
        const sortingArr = ["sentence", "paragraph", "text", "1 sentence", "1 paragraph", "1 text"]
        function contextWithinFix(list: Labeled[]) {
            // sort the list so that sentence is before paragraph
            list.sort((a, b) => sortingArr.indexOf(a.value) - sortingArr.indexOf(b.value))
            const res: Record<string, string> = {}
            for (const elem of list) {
                res[elem.value] = elem.value
            }
            return res
        }
        corpus["within"] = contextWithinFix(corpus["within"])
        corpus["context"] = contextWithinFix(corpus["context"])
    }

    delete modeSettings.attributes

    if (!modeSettings.folders) {
        modeSettings.folders = {}
    }
    return modeSettings
}

/** Determine initial corpus selection and mark them selected in the CorpusListing. */
function setInitialCorpora(): void {
    // if no preselectedCorpora is defined, use all of them
    if (!(settings.preselected_corpora && settings.preselected_corpora.length)) {
        // if all corpora in mode is limited_access, make them all preselected
        if (settings.corpusListing.corpora.filter((corpus) => !corpus.limited_access).length == 0) {
            settings.preselected_corpora = _.map(
                _.filter(settings.corpusListing.corpora, (corpus) => !corpus.hide),
                "id"
            )
            // else filter out the ones with limited_access
        } else {
            settings.preselected_corpora = _.map(
                _.filter(settings.corpusListing.corpora, (corpus) => !(corpus.hide || corpus.limited_access)),
                "id"
            )
        }
    } else {
        let expandedCorpora = []
        for (let preItem of settings.preselected_corpora) {
            preItem = preItem.replace(/^__/g, "")
            expandedCorpora = [].concat(expandedCorpora, treeUtil.getAllCorporaInFolders(settings.folders, preItem))
        }
        // folders expanded, save
        settings.preselected_corpora = expandedCorpora
    }

    const corpusParam = new URLSearchParams(window.location.hash.slice(2)).get("corpus")

    const currentCorpora = corpusParam
        ? _.flatten(_.map(corpusParam.split(","), (val) => treeUtil.getAllCorporaInFolders(settings.folders, val)))
        : settings.preselected_corpora

    settings.corpusListing.select(currentCorpora)
}

/**
 * This function is part of Korp's initialization process
 * It both fetches data, such as config and populates the
 * `settings` object.
 */
export async function fetchInitialData(authDef: Promise<boolean>) {
    settings.korp_backend_url = settings.korp_backend_url.trim()
    if (settings.korp_backend_url.slice(-1) == "/") {
        settings.korp_backend_url = settings.korp_backend_url.slice(0, -1)
    }
    if (!settings.korp_backend_url.startsWith("http")) {
        console.error('"korp_backend_url" in config.yml must start with http:// or https://')
        return
    }

    if (settings.config_dependent_on_authentication) {
        await authDef
    }

    // Start fetching locales asap. Await and read it later, in the Angular context.
    initLocales()
    const config = await getConfig()
    const modeSettings = transformConfig(config)

    _.assign(settings, modeSettings)

    setDefaultConfigValues()

    if (!settings.parallel) {
        settings.corpusListing = new CorpusListing(settings.corpora)
    } else {
        settings.corpusListing = new ParallelCorpusListing(settings.corpora)
    }

    // if the previous config calls didn't yield any corpora, don't ask for info or time
    if (!_.isEmpty(settings.corpora)) {
        const infoDef = getInfoData()
        let timeDef: Promise<[[number, number][], number]>
        if (settings.has_timespan) {
            timeDef = getTimeData()
        }
        setInitialCorpora()

        await infoDef
        if (settings.has_timespan) {
            settings.time_data = await timeDef
        }
    }
}
