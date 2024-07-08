/**
 * @file Typings for config as fetched from backend.
 * @format
 */

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
    }[]
    order?: number
    parallel?: boolean
    preselected_corpora?: string[]
}

export type Corpus = {
    context: Labeled[]
    description: LangString
    hide?: boolean
    id: string
    lang?: string
    limited_access?: boolean
    pivot?: boolean
    pos_attributes: string[]
    struct_attributes: string[]
    custom_attributes?: string[]
    reading_mode?: boolean
    title?: LangString
    within: Labeled[]
}

export type Folder = {
    description?: LangString
    title: LangString
} & ({ subfolders?: Record<string, Folder> } | { corpora?: string[] })

export type Attribute = {
    dataset?: Record<string, string>
    display_type?: "hidden"
    escape?: boolean
    extended_component?: string
    extended_template?: string
    external_search?: string
    group_by?: "group_by" | "group_by_struct"
    hide_compare?: boolean
    hide_extended?: boolean
    hide_sidebar?: boolean
    hide_statistics?: boolean
    internal_search?: boolean
    is_struct_attr?: boolean
    label: LangString
    name: string
    opts?: Record<string, string> | false
    order?: number
    pattern?: string
    ranked?: boolean
    sidebar_component?: string | { name: string; options: Record<string, any> }
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
    sidebar_component?: string | { name: string; options: Record<string, any> }
}
