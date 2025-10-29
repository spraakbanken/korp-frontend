import { html } from "@/util"
import { fetchNews } from "./news-service"
import { locObj } from "@/i18n"

/** Show simple HTML for maintenance-tagged news items. */
export async function createMaintenanceNewsElement(): Promise<string> {
    const allItems = await fetchNews()
    const items = allItems.filter((item) => item.tags?.includes("maintenance"))
    if (!items.length) return ""

    const htmlItems = items.map(
        (item) => html`
            <article>
                <heading><h3>${locObj(item.title)}</h3></heading>
                <div>${locObj(item.body)}</div>
            </article>
        `,
    )
    return html`<section class="maintenance-news">${htmlItems.join("\n")}</section>`
}
