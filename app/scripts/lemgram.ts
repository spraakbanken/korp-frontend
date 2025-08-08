/** @format */
import { loc } from "@/i18n"
import { numberToSuperscript } from "@/util"

export class Lemgram {
    static regexp = /((\w+)--)?(.*?)\.\.(\w+)\.(\d+)(:\d+)?$/

    constructor(
        readonly id: string,
        readonly form: string,
        readonly pos: string,
        readonly index: number,
        readonly morphology?: string,
        readonly start?: number
    ) {}

    /** Parse a lemgram id string to a Lemgram object, or `undefined` if invalid. */
    static parse(id: string): Lemgram | undefined {
        const match = id.trim().match(Lemgram.regexp)!
        if (!match) return
        return new Lemgram(
            id,
            match[3].replace(/_/g, " "),
            match[4].substring(0, 2),
            parseInt(match[5]),
            match[2],
            match[6] ? parseInt(match[6]) : undefined
        )
    }

    /** Render a lemgram string as pretty HTML. */
    toHtml(): string {
        const indexHtml = this.index > 1 ? `<sup>${this.index}</sup>` : ""
        return `${this.form}${indexHtml} (<span rel="localize[${this.pos}]">${loc(this.pos)}</span>)`
    }

    /** Render a lemgram string in pretty plain text. */
    toString(): string {
        const indexSup = this.index > 1 ? numberToSuperscript(this.index) : ""
        return `${this.form}${indexSup} (${loc(this.pos)})`
    }
}
