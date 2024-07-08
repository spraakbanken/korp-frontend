/**
 * @file Typings for config as transformed after being fetched from backend
 * @format
 */

import { LangString } from "@/i18n/types"
import { Attribute, Config, Corpus, CustomAttribute, Folder } from "./config.types"
import { CorpusInfoInfo } from "./corpus-info.types"

export type ConfigTransformed = Omit<Config, "attributes" | "corpora" | "label"> & {
    corpora: Record<string, CorpusTransformed>
    folders: Record<string, Folder>
    mode: {
        label: LangString
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
    private_struct_attributes: string[]
    within: Record<string, string>
    context: Record<string, string>
    info: CorpusInfoInfo
    common_attributes?: Record<string, true>
    time?: Record<number, number>
    non_time?: number
}
