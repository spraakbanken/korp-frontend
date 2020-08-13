/** @format */

/**
 * function to set default values if parameters have been left out of config.js
 */
export function setDefaultConfigValues() {
    if (!settings.hitsPerPageValues) {
        settings.hitsPerPageValues = [25, 50, 75, 100]
    }
    if (!settings.hitsPerPageDefault) {
        settings.hitsPerPageDefault = settings.hitsPerPageValues[0]
    }
}
