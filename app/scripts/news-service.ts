/** @format */
import Yaml from "js-yaml"
import settings from "./settings"
import moment from "moment"

export function isEnabled(): boolean {
    return !!settings["news_url"]
}

export async function fetchNews(): Promise<NewsItem[]> {
    const response = await fetch(settings["news_url"])
    const feedYaml: string = await response.text()

    const itemsRaw = Yaml.load(feedYaml) as NewsItemRaw[]

    const currentDate = new Date().toISOString().slice(0, 10)
    const oneYearAgo = modifyYear(new Date(), -1).toISOString().slice(0, 10)
    const items: NewsItem[] = itemsRaw
        // Hide expired items.
        .filter((item) => !item.expires || formatDate(item.expires) >= currentDate)
        // Stringify dates.
        .map((item) => ({ ...item, created: formatDate(item.created) }))
        // Hide old items.
        .filter((item) => item.created >= oneYearAgo)

    // Sort newest first
    return items.sort((a, b) => b.created.localeCompare(a.created))
}

function modifyYear(date: Date, years: number) {
    date.setFullYear(date.getFullYear() + years)
    return date
}

const formatDate = (date: Date) => moment(date).format("YYYY-MM-DD")

type NewsItemRaw = {
    created: Date
    expires?: Date
    title: string | TranslatedString
    body: string | TranslatedString
}

export type NewsItem = {
    created: string
    title: string | TranslatedString
    body: string | TranslatedString
}

type TranslatedString = { [lang: string]: string }
