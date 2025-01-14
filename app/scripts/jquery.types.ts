/** @format */

export type JQueryExtended<T = HTMLElement> = JQuery<T> & {
    // Defined in /app/lib/jquery.localize.js, a modified version of jquery-localize
    localize: () => JQueryExtended<T>
    // Defined in jq_extensions
    outerHTML: () => JQueryExtended<T>
    localeKey: (key: string) => JQueryExtended<T>
}

export type JQueryStaticExtended = JQueryStatic & {
    // Defined in jq_extensions
    generateFile: (url: string, params: Record<any, any>) => {}
}
