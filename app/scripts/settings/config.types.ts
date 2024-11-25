/**
 * @file Typings for config as fetched from backend.
 * @format
 */

import { OperatorKorp } from "@/cqp_parser/cqp.types"
import { Labeled, LangString } from "@/i18n/types"

export type Config = {
    attributes: {
        pos_attributes: Record<string, Attribute>
        struct_attributes: Record<string, Attribute>
        custom_attributes?: Record<string, CustomAttribute>
    }
    corpora: Record<string, Corpus>
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
    dataset?: Record<string, string>
    display_type?: "hidden"
    escape?: boolean
    extended_component?: NameAndMaybeOptions
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
    sidebar_component?: NameAndMaybeOptions
    sidebar_info_url?: string
    sidebar_hide_label?: boolean
    stats_cqp?: string
    stats_stringify?: string
    stringify?: string
    translation?: Record<string, string>
    type?: "set" | "url"
}

export type CustomAttribute = {
    custom_type: string
    label: LangString
    name: string
    pattern?: string
    sidebar_component?: NameAndMaybeOptions
}

export type NameAndMaybeOptions<O extends {} = Record<string, any>> = string | { name: string; options: O }
