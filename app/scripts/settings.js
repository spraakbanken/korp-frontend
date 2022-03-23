/** @format */

/**
 * function to set default values if parameters have been left out of config.js
 */
export function setDefaultConfigValues() {
    if (!settings["hits_per_page_values"]) {
        settings["hits_per_page_values"] = [25, 50, 75, 100]
    }
    if (!settings["hits_per_page_default"]) {
        settings["hits_per_page_default"] = settings["hits_per_page_values"][0]
    }
    if (!settings.groupStatistics) {
        settings.groupStatistics = []
    }
    if (!settings.backendURLMaxLength) {
        // The default maximum URI length for Apache is 8190 but keep
        // some safety margin
        settings.backendURLMaxLength = 8100
    }
    if (!settings["default_language"]) {
        settings["default_language"] = "swe"
    }
    // codes for translation ISO-639-1 to 639-2
    if (!settings.isoLanguages) {
        settings.isoLanguages = {
            en: "eng",
            sv: "swe",
            fi: "fin",
            da: "dan",
            no: "nor",
        }
    }
}
