/**
 * @file Typings for config as fetched from backend.
 */

import { OperatorKorp } from "@/cqp_parser/cqp.types"
import { Labeled, LangString, LocLangMap, LocMap } from "@/i18n/types"

export type Config = {
    attributes: {
        pos_attributes: Record<string, Attribute>
        struct_attributes: Record<string, Attribute>
        custom_attributes?: Record<string, CustomAttribute>
    }
    corpora: Record<string, Corpus>
    /** Writing direction of corpus text. */
    dir?: "rtl"
    folders?: Record<string, Folder>
    label: LangString
    map_enabled?: boolean
    mode_description?: LangString
    modes: {
        mode: string
        label: LangString
        labOnly?: boolean
    }[]
    order?: number
    parallel?: boolean
    preselected_corpora?: string[]
    start_lang?: string
}

export type Corpus = {
    /** Attributes to use in global filters */
    attribute_filters: string[]
    context: Labeled[]
    description: LangString
    hide?: boolean
    id: string
    /** Must be present in parallel corpus */
    lang?: string
    limited_access?: boolean
    linked_to?: string[]
    pivot?: boolean
    pos_attributes: string[]
    struct_attributes: string[]
    custom_attributes?: string[]
    reading_mode?: boolean | ReadingModeConfig
    title: LangString
    within: Labeled[]
}

export type CorpusParallel = Corpus & Required<Pick<Corpus, "lang" | "linked_to">>

export type ReadingModeConfig = {
    component: string
    group_element?: string
}

export type Folder = {
    description?: LangString
    title: LangString
    subfolders?: Record<string, Folder>
    corpora?: string[]
}

export type Attribute = {
    dataset?: Record<string, string> | string[]
    /** Handled by CorpusSet */
    disabled?: true
    display_type?: "hidden"
    escape?: boolean
    extended_component?: MaybeWithOptions
    extended_template?: string
    external_search?: string
    group_by?: "group_by" | "group_by_struct"
    hide_compare?: boolean
    hide_extended?: boolean
    hide_sidebar?: boolean
    hide_statistics?: boolean
    internal_search?: boolean
    is?: string
    is_struct_attr?: boolean
    label: LangString
    name: string
    /** Available operators, default is to copy the `default_options` setting */
    opts?: Record<string, OperatorKorp> | false
    order?: number
    pattern?: string
    ranked?: boolean
    sidebar_component?: MaybeWithOptions
    sidebar_info_url?: string
    sidebar_hide_label?: boolean
    stats_cqp?: string
    stats_stringify?: string
    stringify?: string
    translation?: LocLangMap | LocMap
    type?: "set" | "url"
}

export type CustomAttribute = {
    custom_type: string
    label: LangString
    name: string
    pattern?: string
    sidebar_component?: MaybeWithOptions
}

/** A value that names some object and possibly supplies options for that object. */
export type MaybeWithOptions<O extends {} = Record<string, any>> = string | { name: string; options: O }

/** An object that possibly requires options for instantiation. */
export type MaybeConfigurable<T, O extends {} = {}> = T | Configurable<T, O>

/** An object that requires options for instantiation. */
export type Configurable<T, O extends {} = {}> = (options: O) => T
