/**
 * @file Typings for frontend settings as can be loaded from configuration directory.
 * @format
 */

import { Labeled, LangString } from "@/i18n/types"
import { Attribute } from "./config.types"
import { RootScope } from "@/root-scope.types"
import { HashParams } from "@/urlparams"
import { OperatorKorp } from "@/cqp_parser/cqp.types"

export type AppSettings = {
    auth_module?: string | { module: string; options: Record<string, any> }
    autocomplete?: boolean
    backendURLMaxLength: number
    common_struct_types?: Record<string, Attribute>
    config_dependent_on_authentication?: boolean
    corpus_config_url?: () => Promise<string>
    corpus_info_link?: {
        url_template: string
        label: LangString
    }
    cqp_prio: string[]
    default_options?: Record<string, OperatorKorp>
    default_language: string
    default_overview_context: string
    default_reading_context: string
    default_within?: Record<string, string>
    description?: string
    download_cgi_script?: string
    download_formats: string[]
    download_format_params: Record<string, Record<string, string | number>>
    enable_backend_kwic_download?: boolean
    enable_frontend_kwic_download?: boolean
    frontpage?: {
        corpus_updates?: boolean
        examples?: SearchExample[]
    }
    group_statistics: string[]
    has_timespan: boolean
    hits_per_page_values: number[]
    hits_per_page_default: number
    initialization_checks?: (rootScope: RootScope) => Promise<boolean>
    /** codes for translation ISO-639-1 to 639-2 */
    iso_languages: Record<string, string>
    korp_backend_url: string
    languages: Labeled[]
    map_center?: { lat: number; lng: number; zoom: number }
    map_enabled?: boolean
    markup: Record<string, string>
    matomo?: {
        url?: string
        site?: number
        development?: { url?: string; site?: number }
        staging?: { url?: string; site?: number }
        production?: { url?: string; site?: number }
    }
    news_url?: string
    reduce_word_attribute_selector: "union" | "intersection"
    reduce_struct_attribute_selector: "union" | "intersection"
    statistics?: boolean
    statistics_case_insensitive_default?: boolean
    statistics_search_default: boolean
    urnResolver?: string
    visible_modes: number
    word_label: Record<string, string>
    word_picture?: boolean
    word_picture_tagset?: Record<string, string>
    word_picture_conf?: Record<string, WordPictureDef[]>
}

export type SearchExample = {
    label: LangString
    hint?: LangString
    params: HashParams
}

export type WordPictureDef = (WordPictureDefItem | "_")[]
export type WordPictureDefItem = {
    rel: string
    css_class?: string
    field_reverse?: boolean
}
