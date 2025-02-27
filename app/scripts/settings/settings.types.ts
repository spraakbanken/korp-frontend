/**
 * @file Typings for settings as they are stored and used in the frontend.
 * @format
 */

import { type CorpusListing } from "@/corpus_listing"
import { AppSettings } from "./app-settings.types"
import { ConfigTransformed } from "./config-transformed.types"

export type Settings = AppSettings &
    ConfigTransformed & {
        // Set in data_init.js fetchInitialData()
        corpusListing: CorpusListing
    }
