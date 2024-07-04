/**
 * @file Typings for settings as they are stored and used in the frontend.
 * @format
 */

import { CorpusListing } from "@/corpus_listing"
import { AppSettings } from "./app-settings.types"
import { ConfigTransformed } from "./config-transformed.types"

export type Settings = AppSettings &
    ConfigTransformed & {
        // Populated in data_init.js fetchInitialData() using the `/timespan` API
        time_data: [
            [number, number][], // Token count per year
            number // Undated tokens
        ]
        // Set in data_init.js fetchInitialData()
        corpusListing: CorpusListing
    }
