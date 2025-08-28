/** @format */
import { defaults } from "lodash"
import settings from "korp_config"
import { AppSettings } from "./app-settings.types"
import { Settings } from "./settings.types"

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
    // Default values for some settings properties
    const settingsDefaults: Partial<AppSettings> = {
        hits_per_page_values: [25, 50, 75, 100],
        group_statistics: [],
        // The default maximum URI length for Apache is 8190 but keep
        // some safety margin
        backendURLMaxLength: 8100,
        default_language: "eng",
        default_options: { is: "=", is_not: "!=" },
        // codes for translation ISO-639-1 to 639-2
        iso_languages: {
            en: "eng",
            sv: "swe",
            fi: "fin",
            da: "dan",
            no: "nor",
        },
        cqp_prio: ["deprel", "pos", "msd", "suffix", "prefix", "lemma", "lex", "word"],
        word_label: { swe: "ord", eng: "word" },
        visible_modes: 6,
        has_timespan: true,
    }

    // Assign default values to settings properties if undefined
    defaults(settings, settingsDefaults)

    // Default values depending on other settings values, possibly
    // assigned a default value above
    const settingsDefaultsDep: Partial<AppSettings> = {
        hits_per_page_default: settings.hits_per_page_values[0],
    }

    defaults(settings, settingsDefaultsDep)
}

export function getDefaultWithin() {
    return Object.keys(settings["default_within"] || {})[0]
}
