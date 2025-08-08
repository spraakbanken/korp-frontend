/** @format */
import { numberToSuperscript } from "@/util"

/**
 * A parsed SALDO id.
 *
 * Read about the SALDO lexicon resource at https://spraakbanken.gu.se/en/resources/saldo
 */
export class Saldo {
    static regexp = /(.*?)\.\.(\d\d?)(:\d+)?$/

    constructor(readonly id: string, readonly form: string, readonly index: number, readonly start?: number) {}

    /** Parse a SALDO id string to a Saldo object, or `undefined` if invalid. */
    static parse(id: string): Saldo | undefined {
        const match = id?.trim().match(Saldo.regexp)
        if (!match) return
        const [, form, index] = match
        return new Saldo(id, form.replace(/_/g, " "), parseInt(index))
    }

    /** Render a SALDO string as pretty HTML. */
    toHtml(): string {
        const indexHtml = this.index > 1 ? `<sup>${this.index}</sup>` : ""
        return this.form + indexHtml
    }

    /** Render a SALDO string in pretty plain text. */
    toString(): string {
        const indexSup = this.index > 1 ? numberToSuperscript(this.index) : ""
        return this.form + indexSup
    }
}
