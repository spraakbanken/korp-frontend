/** @format */

/**
 * function to set default values if parameters have been left out of config.js
 */
export function setDefaultConfigValues() {
    // Default values for some settings properties
    const settingsDefaults = {
        hits_per_page_values: [25, 50, 75, 100],
        group_statistics: [],
        // The default maximum URI length for Apache is 8190 but keep
        // some safety margin
        backendURLMaxLength: 8100,
        default_language: "eng",
        // codes for translation ISO-639-1 to 639-2
        isoLanguages: {
            en: "eng",
            sv: "swe",
            fi: "fin",
            da: "dan",
            no: "nor",
        },
        cqp_prio: ["deprel", "pos", "msd", "suffix", "prefix", "grundform", "lemgram", "saldo", "word"],
        statistics_search_default: true,
        word_label: { swe: "ord", eng: "word" },
        visible_modes: 6,
        has_timespan: true,
    }

    // Assign default values to settings properties if undefined
    _.defaults(settings, settingsDefaults)

    // Default values depending on other settings values, possibly
    // assigned a default value above
    const settingsDefaultsDep = {
        hits_per_page_default: settings["hits_per_page_values"][0],
    }

    _.defaults(settings, settingsDefaultsDep)
}
