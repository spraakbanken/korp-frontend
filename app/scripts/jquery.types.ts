export type JQueryExtended<T = HTMLElement> = JQuery<T> & {
    // Defined in /app/lib/jquery.localize.js, a modified version of jquery-localize
    localize: () => JQueryExtended<T>
}

export type JQueryStaticExtended = JQueryStatic & {
    // Defined in jq_extensions
    generateFile: (url: string, params: Record<any, any>) => {}
}
