/** @format */
import _ from "lodash"
import settings, { setDefaultConfigValues } from "@/settings"
import currentMode from "@/mode"
import { getAllCorporaInFolders } from "./components/corpus-chooser/util"
import { CorpusListing } from "./corpus_listing"
import { ParallelCorpusListing } from "./parallel/corpus_listing"
import { fromKeys } from "@/util"
import { Labeled } from "./i18n/types"
import { Attribute, Config, Corpus, CorpusParallel, CustomAttribute } from "./settings/config.types"
import { ConfigTransformed, CorpusTransformed } from "./settings/config-transformed.types"
import { korpRequest } from "./backend/common"
import { getLocData } from "./loc-data"

type InfoData = Record<string, Pick<CorpusTransformed, "info" | "private_struct_attributes">>

/**
 * Fetch CWB corpus info (Size, Updated etc).
 */
async function getInfoData(corpusIds: string[]): Promise<InfoData> {
    if (!corpusIds.length) return {}

    const params = { corpus: corpusIds.map((id) => id.toUpperCase()).join(",") }
    const data = await korpRequest("corpus_info", params)

    return fromKeys(corpusIds, (corpusId) => ({
        info: data.corpora[corpusId.toUpperCase()].info,
        private_struct_attributes: data.corpora[corpusId.toUpperCase()].attrs.s.filter(
            (name) => name.indexOf("__") !== -1
        ),
    }))
}

async function getConfig(): Promise<Config> {
    // Load static corpus config if it exists.
    try {
        const corpusConfig = require(`modes/${currentMode}_corpus_config.json`) as Config
        console.log(`Using static corpus config`)
        return corpusConfig
    } catch {}

    // The corpora to include are normally given by the mode config, but allow defining it elsewhere (used by Mink)
    const corpusIds = settings.get_corpus_ids ? await settings.get_corpus_ids() : undefined

    const config = await korpRequest("corpus_config", {
        mode: currentMode,
        corpus: corpusIds?.join(",") || undefined,
    })

    return config
}

/**
 * Transform the raw config fetched form backend, to a structure that frontend code can handle.
 *
 * TODO: Use the `Config` and `ConfigTransformed` types, not `any`.
 *
 * @see ./settings/README.md
 */
function transformConfig(config: Config, infos: InfoData): ConfigTransformed {
    // take the backend configuration format for attributes and expand it
    // TODO the internal representation should be changed to a new, more compact one.
    function transformCorpus(corpus: Corpus): CorpusTransformed {
        if (corpus.title == undefined) {
            corpus.title = corpus.id
        }

        function transformAttributes2<T extends Attribute | CustomAttribute>(
            attrsKey: keyof Config["attributes"]
        ): [Record<string, T>, string[]] {
            const names = corpus[attrsKey]
            const attrs = config.attributes[attrsKey] as Record<string, T>
            if (!names || !attrs) return [{}, []]
            const defs1 = _.pick(attrs, names)
            const defs = _.keyBy(defs1, "name")
            const order = names.map((name) => attrs[name].name)
            return [defs, order]
        }

        const [attributes, _attributes_order] = transformAttributes2("pos_attributes")
        const [struct_attributes, _struct_attributes_order] = transformAttributes2("struct_attributes")
        const [custom_attributes, _custom_attributes_order] = transformAttributes2<CustomAttribute>("custom_attributes")

        return {
            ..._.omit(corpus, "pos_attributes"),
            attributes,
            struct_attributes,
            custom_attributes,
            _attributes_order,
            _struct_attributes_order,
            _custom_attributes_order,
            context: contextWithinFix(corpus["context"]),
            within: contextWithinFix(corpus["within"]),
            info: infos[corpus.id].info,
            private_struct_attributes: infos[corpus.id].private_struct_attributes,
        }
    }

    // TODO use the new format instead
    // remake the new format of witihns and contex to the old
    function contextWithinFix(list: Labeled[]) {
        // sort the list so that sentence is before paragraph
        const sortingArr = ["sentence", "paragraph", "text", "1 sentence", "1 paragraph", "1 text"]
        list.sort((a, b) => sortingArr.indexOf(a.value) - sortingArr.indexOf(b.value))
        return _.fromPairs(list.map((elem) => [elem.value, elem.value]))
    }

    const modes = config.modes.map((mode) => ({ ...mode, selected: mode.mode == currentMode }))

    return {
        folders: {},
        ..._.omit(config, "pos_attributes", "corpora"),
        corpora: _.mapValues(config.corpora, transformCorpus),
        modes,
        mode: modes.find((mode) => mode.selected)!,
    }
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
        let expandedCorpora: string[] = []
        for (let preItem of settings.preselected_corpora) {
            preItem = preItem.replace(/^__/g, "")
            expandedCorpora.push(...getAllCorporaInFolders(settings.folders, preItem))
        }
        // folders expanded, save
        settings.preselected_corpora = expandedCorpora
    }
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

    // Start fetching translation strings.
    getLocData()

    if (settings.config_dependent_on_authentication) {
        await authDef
    }

    setDefaultConfigValues()

    // Fetch corpus configuration and metadata
    const config = await getConfig()
    const infos = await getInfoData(Object.keys(config.corpora))
    // Add config and metadata to settings
    const configTransformed = transformConfig(config, infos)
    Object.assign(settings, configTransformed)

    // only if the current mode is parallel, we load the special code required
    if (config.parallel) {
        require("./parallel/corpus_listing")
    }

    if (!settings.parallel) {
        settings.corpusListing = new CorpusListing(settings.corpora)
    } else {
        settings.corpusListing = new ParallelCorpusListing(
            settings.corpora as Record<string, CorpusTransformed<CorpusParallel>>
        )
    }

    if (!_.isEmpty(settings.corpora)) {
        setInitialCorpora()
    }
}
