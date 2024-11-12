/** @format */

import { localStorageGet, localStorageSet } from "@/local-storage"

export function updateSearchHistory(value?: string, href?: string): void {
    /** Filter a querystring for the "search" and "corpus" params ("#?foo=bar&corpus=baz" => "corpus=baz")  */
    const filterParam = (url: string): string =>
        url
            .split("#")[1]
            .split("&")
            .filter((item) => item.split("=")[0] === "search" || item.split("=")[0] === "corpus")
            .join("&")

    const searches = localStorageGet("searches") || []
    const searchLocations = searches.map((item) => filterParam(item.location))

    // Add a new search to top of list model
    // "new" means "has different corpus+search than existing"
    if (value != null && href != null && !searchLocations.includes(filterParam(href))) {
        searches.unshift({ label: value, location: href })
        localStorageSet("searches", searches)
    }

    // Clear options from select element
    $("#search_history").empty()

    // If list is empty, exit here
    if (!searches.length) {
        return
    }

    // Generate options for select element
    const opts = searches.map((item) => $("<option>", { value: item.location }).text(item.label).get(0)!)
    const placeholder = ($("<option>") as any).localeKey("search_history").get(0)
    const clear = ($("<option class='clear'>") as any).localeKey("search_history_clear")

    // Output options
    $("#search_history").append(opts).prepend(clear).prepend(placeholder)
}
