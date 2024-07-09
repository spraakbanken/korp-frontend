export type JQueryExtended<T = HTMLElement> = JQuery<T> & {
    localize: () => JQueryExtended<T>
    outerHTML: () => JQueryExtended<T>
    localeKey: (key: string) => JQueryExtended<T>
}

export type JQueryStaticExtended = JQueryStatic & {
    generateFile: (url: string, params: Record<any, any>) => {}
}