/**
 * @file Typings for config as transformed after being fetched from backend
 * @format
 */

import { LangMap } from "@/i18n/types"
import { Attribute, Config, Corpus, CustomAttribute, Folder } from "./config.types"

export type ConfigTransformed = Omit<Config, "attributes" | "corpora" | "label"> & {
    corpora: Record<string, CorpusTransformed>
    folders: Record<string, Folder>
    mode: {
        label: string | LangMap
    }
}

export type CorpusTransformed = Omit<
    Corpus,
    "pos_attributes" | "struct_attributes" | "custom_attributes" | "within" | "context"
> & {
    attributes: Record<string, Attribute>
    struct_attributes: Record<string, Attribute>
    custom_attributes?: Record<string, CustomAttribute>
    _attributes_order: string[]
    _struct_attributes_order: string[]
    _custom_attributes_order: string[]
    within: Record<string, string>
    context: Record<string, string>
    info: {
        Name: string
        Size: string | number
        Sentences: string | number
        Updated?: string
        FirstDate?: string
        LastDate?: string
        Protected?: boolean
    }
}
