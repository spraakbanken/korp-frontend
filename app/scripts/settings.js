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
    if (!settings.groupStatistics) {
        settings.groupStatistics = []
    }
    if (!settings.backendURLMaxLength) {
        // The default maximum URI length for Apache is 8190 but keep
        // some safety margin
        settings.backendURLMaxLength = 8100
    }

    // TODO this cannot be done here because this is before the configuration is loaded
    // if (!(settings.preselectedCorpora && settings.preselectedCorpora.length)) {
    //     settings.preselectedCorpora = _.map(settings.corpusListing.corpora, "id")
    // }
}
