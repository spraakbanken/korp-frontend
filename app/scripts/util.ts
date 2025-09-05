/** @format */
import { intersection, merge, pick } from "lodash"
import moment, { Moment } from "moment"

/** Use html`<div>html here</div>` to enable formatting template strings with Prettier. */
export const html = String.raw

/** The build hash, added to filenames for some asset files. */
// @ts-expect-error This magic Webpack variable is undefined, but is replaced at build time
export const BUILD_HASH = __webpack_hash__

/** Create an object from a list of keys and a function for creating corresponding values. */
export const fromKeys = <K extends keyof any, T>(keys: K[], getValue: (key: K) => T) =>
    Object.fromEntries(keys.map((key) => [key, getValue(key)]))

/** Takes an array of mapping objs and returns their intersection */
export function objectIntersection<T extends object>(objs: T[]): T {
    const keys = intersection(...objs.map(Object.keys))
    return merge({}, ...objs.map((obj) => pick(obj, ...keys)))
}

/** Merge a list of objects, like _.merge but return-typed */
export const objectUnion = <T extends object>(objs: T[]): T => merge({}, ...objs) as T

/**
 * Allows a given class to be overridden before instantiation.
 *
 * Define a factory for the standard class: `fooFactory = new Factory(Foo)`
 * Then optionally override the class to be used: `fooFactory.setService(Bar)`
 * Finally instantiate: `fooFactory.create()`
 */
export class Factory<T extends new (...args: any) => InstanceType<T>> {
    private class_: T
    constructor(class_: T) {
        this.setClass(class_)
    }
    setClass(class_: T) {
        this.class_ = class_
    }
    create(...args: ConstructorParameters<T>): InstanceType<T>
    create(...args: any[]): InstanceType<T> {
        return new this.class_(...args)
    }
}

export abstract class Observable {
    private listeners: Array<() => void> = []
    listen(cb: () => void) {
        this.listeners.push(cb)
    }
    protected notify() {
        this.listeners.forEach((cb) => cb())
    }
}

/** Create a Moment that uses the date from one Date object and the time from another. */
export function combineDateTime(date: Date, time: Date): Moment {
    const m = moment(moment(date).format("YYYY-MM-DD"))
    const m_time = moment(time)
    m.add(m_time.hour(), "hour")
    m.add(m_time.minute(), "minute")
    return m
}

/** FooBar -> foo-bar */
export const kebabize = (str: string): string =>
    [...str].map((x, i) => (x == x.toUpperCase() ? (i ? "-" : "") + x.toLowerCase() : x)).join("")

/** Replace HTML special chars */
export const escapeHtml = (str: string): string =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Unicode-tolerant Base64 encoding, copied from https://stackoverflow.com/a/43271130 */
export function toBase64(str: string) {
    const binary: string[] = []
    const bytes = new Uint8Array(new TextEncoder().encode(str))
    for (let i = 0; i < bytes.byteLength; i++) {
        binary.push(String.fromCharCode(bytes[i]))
    }
    return window.btoa(binary.join(""))
}

/**
 * Represent a number with superscript characters like "⁴²".
 * @param n A decimal number.
 * @returns A string of superscript numbers.
 */
export function numberToSuperscript(number: string | number): string {
    return [...String(number)].map((n) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(n)]).join("")
}

/** Format time as hh:mm:ss if hours > 0, else mm:ss */
export function transformSeconds(seconds: number) {
    const hhmmss = new Date(seconds * 1000).toISOString().substring(11, 19)
    return hhmmss.replace(/^00:/, "")
}

/** Return htmlStr with quoted references to "img/filename.ext" replaced with "img/filename.BUILD_HASH.ext". */
export function addImgHash(htmlStr: string): string {
    return htmlStr.replace(/(["']img\/[^"']+)(\.[^"'.]+["'])/g, `$1.${BUILD_HASH}$2`)
}

/** Show a basic modal with vanilla JS */
export function simpleModal(html: string) {
    const dialog = document.createElement("dialog")
    dialog.classList.add("bg-white", "p-4", "rounded-lg", "shadow-lg", "border")
    const button = '<button class="block mx-auto btn btn-primary mt-4">OK</button>'
    dialog.innerHTML = html + button
    document.body.appendChild(dialog)
    dialog.showModal()
    dialog.querySelector("button")!.addEventListener("click", () => dialog.close())
}

/** Split a string by the first occurence of a given separator */
export const splitFirst = (sep: string, s: string): [string, string] => {
    const pos = s.indexOf(sep)
    if (pos == -1) return [s, ""]
    return [s.slice(0, pos), s.slice(pos + sep.length)]
}

/** Escape special characters in a string so it can be safely inserted in a regular expression. */
export const regescape = (s: string): string => s.replace(/[.|?|+|*||'|()^$\\]/g, "\\$&").replace(/"/g, '""')

/** Unescape special characters in a regular expression – remove single backslashes and replace double with single. */
export const unregescape = (s: string): string => s.replace(/\\\\|\\/g, (match) => (match === "\\\\" ? "\\" : ""))

/** Convert object to FormData */
export function toFormData(obj: Record<string, any>): FormData {
    const formData = new FormData()
    Object.entries(obj).forEach(([key, value]) => formData.append(key, value))
    return formData
}

/** Append search params to url */
export function buildUrl(base: string, params: Record<string, any>): string {
    const url = new URL(base)
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))
    return url.toString()
}

/** URL search params as a string value for comparison. */
export const paramsString = (params: URLSearchParams | Record<string, any>) =>
    JSON.stringify([...new URLSearchParams(params).entries()].sort())

/** Trigger a download in the browser. */
export function downloadFile(data: string, filename: string, type: string) {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
