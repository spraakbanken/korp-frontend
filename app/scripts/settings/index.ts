import settings from "korp_config"
import { Settings } from "./settings.types"
import { Attribute, DeptreeConfig, MaybeConfigurable, MaybeWithOptions } from "./config.types"
import { isFunction } from "lodash"
import { WordPictureDef } from "./app-settings.types"
import { CorpusTransformed } from "./config-transformed.types"

export default settings

declare global {
    interface Window {
        settings: Settings
    }
}

if (process.env.ENVIRONMENT != "production") window.settings = settings

/**
 * function to set default values if parameters have been left out of config.js
 */
export function setDefaultConfigValues() {
    settings["hits_per_page_values"] ??= [25, 50, 75, 100]
    settings["group_statistics"] ??= []
    // The default maximum URI length for Apache is 8190 but keep some safety margin
    settings["backendURLMaxLength"] ??= 8100
    settings["default_language"] ??= "eng"
    settings["default_options"] ??= { is: "=", is_not: "!=" }
    settings["iso_languages"] ??= {
        en: "eng",
        sv: "swe",
        fi: "fin",
        da: "dan",
        no: "nor",
    }
    settings["cqp_prio"] ??= ["deprel", "pos", "msd", "suffix", "prefix", "lemma", "lex", "word"]
    settings["word_label"] ??= { swe: "ord", eng: "word" }
    settings["visible_modes"] ??= 6
    settings["has_timespan"] ??= true

    // Set default values depending on other settings last
    settings["hits_per_page_default"] ??= settings.hits_per_page_values[0]
}

/**
 * Get an object from a registry with optional options.
 *
 * The definition is a name, or a name and options.
 * If the object is a function, the options are passed to it.
 */
export function getConfigurable<T>(
    registry: Record<string, MaybeConfigurable<T>>,
    definition: MaybeWithOptions,
): T | undefined {
    const name = typeof definition === "string" ? definition : definition.name
    const widget = registry[name]
    if (isFunction(widget)) {
        const options = typeof definition == "object" ? definition.options : {}
        return widget(options)
    }
    return widget
}

export const getDefaultWithin = () => Object.keys(settings["default_within"] || {})[0]

/** Identify deptree attribute names */
export function getDeptreeAttrMapping(corpus: CorpusTransformed): Record<string, string> {
    const defaultMapping = {
        ref: "ref",
        pos: "pos",
        head: "dephead",
        rel: "deprel",
    }
    return { ...defaultMapping, ...corpus.deptree?.attrs }
}

/** Convert Word picture config to use abbreviations for POS and relation, to match the data. */
export function getWordPictureConfig(): Record<string, WordPictureDef[]> {
    // The tagset maps long labels to lower-case short codes
    const labelToCode = (label: string) => settings["word_picture_tagset"]?.[label]?.toUpperCase()
    return Object.fromEntries(
        Object.entries(settings["word_picture_conf"] || {}).map(([posLong, section]) => [
            // Convert the conf object's long POS keys
            labelToCode(posLong),
            // Convert each column's `rel` long relation label
            section.map((table) =>
                table.map((column) => (column == "_" ? column : { ...column, rel: labelToCode(column.rel) })),
            ),
        ]),
    )
}

/** An attribute's dataset options as an object */
export const normalizeDataset = (dataset: NonNullable<Attribute["dataset"]>): Record<string, string> =>
    Array.isArray(dataset) ? Object.fromEntries(dataset.map((k) => [k, k])) : dataset

/** Get attribute name for use in CQP, prepended with `_.` if it is a structural attribute. */
export const prefixAttr = (attr: Attribute): string => (attr["is_struct_attr"] ? `_.${attr.name}` : attr.name)
