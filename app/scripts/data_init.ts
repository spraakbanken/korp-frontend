import { keyBy, mapValues, omit, pick } from "lodash"
import settings, { setDefaultConfigValues } from "@/settings"
import currentMode from "@/mode"
import { corpusListing, setCorpusListing } from "@/corpora/corpus_listing"
import { CorpusSet } from "@/corpora/corpus-set"
import { CorpusSetParallel } from "@/parallel/corpus-set-parallel"
import { fromKeys } from "@/util"
import { locAttribute } from "@/i18n"
import { Labeled, LocLangMap, LocMap } from "@/i18n/types"
import { Attribute, Config, Corpus, CorpusParallel, CustomAttribute } from "@/settings/config.types"
import { ConfigTransformed, CorpusTransformed } from "@/settings/config-transformed.types"
import { korpRequest } from "@/backend/common"
import { getLocData } from "@/i18n/loc-data"
import moment from "moment"
import { getAllCorporaInFolders } from "./corpora/corpus-chooser"

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
            (name) => name.indexOf("__") !== -1,
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
            attrsKey: keyof Config["attributes"],
        ): [Record<string, T>, string[]] {
            const names = corpus[attrsKey]
            const attrs = config.attributes[attrsKey] as Record<string, T>
            if (!names || !attrs) return [{}, []]
            const defs1 = pick(attrs, names)
            const defs = keyBy(defs1, "name")
            const order = names.map((name) => attrs[name].name)
            return [defs, order]
        }

        const [attributes, _attributes_order] = transformAttributes2("pos_attributes")
        const [struct_attributes, _struct_attributes_order] = transformAttributes2("struct_attributes")
        const [custom_attributes, _custom_attributes_order] = transformAttributes2<CustomAttribute>("custom_attributes")

        return {
            ...omit(corpus, "pos_attributes"),
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
        return Object.fromEntries(list.map((elem) => [elem.value, elem.value]))
    }

    const modes = config.modes.map((mode) => ({ ...mode, selected: mode.mode == currentMode }))

    // Resolve folder names in the default corpus selection.
    // Compat added in October 2025: from now on this setting doesn't need to prepend folder names with "__"
    const preselectedCorpora = config.preselected_corpora?.flatMap((id) =>
        getAllCorporaInFolders(config.folders || {}, id.replace(/^__/, "")),
    )

    return {
        folders: {},
        ...omit(config, "pos_attributes", "corpora"),
        corpora: mapValues(config.corpora, transformCorpus),
        modes,
        mode: modes.find((mode) => mode.selected)!,
        preselected_corpora: preselectedCorpora,
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

    const corpora = Object.values(settings.corpora)
    const corpusListing = settings.parallel
        ? new CorpusSetParallel(corpora as CorpusTransformed<CorpusParallel>[])
        : new CorpusSet(corpora)
    setCorpusListing(corpusListing)
}

/** Find most recently updated corpora. */
export function getRecentCorpusUpdates(): CorpusTransformed[] {
    const limitDate = moment().subtract(6, "months")
    return corpusListing.corpora
        .filter((corpus) => corpus.info.Updated && moment(corpus.info.Updated).isSameOrAfter(limitDate))
        .sort((a, b) => b.info.Updated!.localeCompare(a.info.Updated!))
}

/** Get the dataset options of an attribute. */
export function getDatasetOptions(
    dataset: Attribute["dataset"],
    translation?: LocMap | LocLangMap,
    lang?: string,
    sort?: boolean,
): [string, string][] {
    dataset ??= []
    const options: [string, string][] = Array.isArray(dataset)
        ? dataset.map((item) => [item, locAttribute(translation, item, lang)])
        : Object.entries(dataset).map(([k, v]) => [k, locAttribute(translation, v, lang)])
    return sort ? options.sort((a, b) => a[1].localeCompare(b[1], lang)) : options
}
