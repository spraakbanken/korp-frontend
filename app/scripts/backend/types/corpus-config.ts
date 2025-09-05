/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Information/paths/~1corpus_config/get */
import { Config } from "@/settings/config.types"

export type CorpusConfigParams = {
    mode: string
    corpus?: string
    include_lab?: string
}

export type CorpusConfigResponse = Config
