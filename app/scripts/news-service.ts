/** @format */
import Yaml from "js-yaml"
import settings from "./settings"
import moment from "moment"

export function isEnabled(): boolean {
    return !!settings["news_desk_url"]
}

export async function fetchNews(): Promise<NewsItem[]> {
    const response = await fetch(settings["news_desk_url"])
    const feedYaml: string = await response.text()

    const itemsRaw = Yaml.load(feedYaml) as NewsItemRaw[]

    const currentDate = new Date().toISOString().slice(0, 10)
    const items: NewsItem[] = itemsRaw
        // Hide expired items.
        .filter((item) => !item.expires || formatDate(item.expires) >= currentDate)
        // Stringify dates.
        .map((item) => ({ ...item, created: moment(item.created).format("YYYY-MM-DD") }))

    return items
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
