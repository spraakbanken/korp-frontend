/** @format */
import memoize from "lodash/memoize"
import { LangLocMap, LocMap } from "./i18n/types"
import settings from "./settings"
import { BUILD_HASH } from "./util"

// Using memoize, this will only fetch once and then return the same promise when called again.
// TODO it would be better only to load additional languages when there is a language change
export const getLocData = memoize(async () => {
    locData = {}
    const defs: Promise<void>[] = []
    for (const langObj of settings.languages) {
        const lang = langObj.value
        locData[lang] = {}
        for (const pkg of ["locale", "corpora"]) {
            const file = `translations/${pkg}-${lang}.${BUILD_HASH}.json`
            const def = fetch(file)
                .then(async (response) => {
                    if (response.status >= 300) throw new Error()
                    const data = (await response.json()) as LocMap
                    Object.assign(locData![lang], data)
                })
                .catch(() => {
                    console.log("No language file: ", file)
                })
            defs.push(def)
        }
    }

    await Promise.all(defs)
    return locData
})

export let locData: LangLocMap | undefined
