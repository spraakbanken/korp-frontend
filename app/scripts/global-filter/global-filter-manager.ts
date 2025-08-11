/** @format */
import { isEqual, mapValues, pickBy } from "lodash"
import { countAttrValues } from "@/backend/attr-values"
import { RecursiveRecord } from "@/backend/types/attr-values"
import { Condition } from "@/cqp_parser/cqp.types"
import { StoreService } from "@/services/store"
import { Attribute } from "@/settings/config.types"
import { regescape } from "@/util"
import settings from "@/settings"

export type FilterData = {
    attribute: Attribute
    /** Selected values */
    value: string[]
    /** Sorted list of options with counts */
    options: [string, number][]
}

export class GlobalFilterManager {
    attrs: Attribute[]
    data: RecursiveRecord<number>
    filters: Record<string, FilterData> = {}
    listeners: Array<() => void> = []

    constructor(private store: StoreService) {}

    /** Update filter data to match selected attributes. */
    async update(attrs: Attribute[]) {
        this.attrs = [...attrs]
        const attrNames = attrs.map((attr) => attr.name)

        // Remove filters that are no more applicable
        for (const name in this.filters) {
            if (!attrNames.includes(name)) delete this.filters[name]
        }

        // Add new filters
        for (const attr of attrs) {
            this.filters[attr.name] ??= {
                attribute: attr,
                value: [], // Selection empty by default
                options: [], // Filled in updateData
            }
        }

        const corpusIds = settings.corpusListing.getSelectedCorpora()

        // Fetch token counts keyed in multiple dimensions by the values of attributes
        const multiAttrs = attrs.filter((attr) => attr.type === "set").map((attr) => attr.name)
        this.data = corpusIds.length && attrs.length ? await countAttrValues(corpusIds, attrNames, multiAttrs) : {}

        // Abort if corpus selection has changed since the request was made
        if (!isEqual(corpusIds, settings.corpusListing.getSelectedCorpora())) return

        this.updateOptions()

        // Deselect values that are not in the options
        for (const filter of Object.values(this.filters)) {
            filter.value = filter.value.filter((value) => filter.options.some(([v]) => v === value))
        }
    }

    select(attr: string, values: string[]) {
        this.filters[attr].value = values
        this.updateOptions()
    }

    setSelection(values: Record<string, string[]>) {
        // Copy values from param, reset filters not in param
        for (const attr in this.filters) {
            this.filters[attr].value = values[attr] || []
        }

        this.updateOptions()
    }

    getSelection(): Record<string, string[]> {
        const values = mapValues(this.filters, (filter) => filter.value)
        // Skip empty filters.
        return pickBy(values, (vals) => vals.length)
    }

    listen(callback: () => void) {
        this.listeners.push(callback)
    }

    /** Update filter options' disabled state and counts from current selection. */
    private updateOptions() {
        // reset all filters
        for (const filter of Object.values(this.filters)) filter.options = []

        // recursively decide the counts of all values
        const attrNames = this.attrs.map((attr) => attr.name)
        this.collectAndSum(attrNames, this.data, true)

        // merge duplicate child values
        for (const filter of Object.values(this.filters)) {
            // Sum the counts of duplicate values
            const options: Record<string, number> = {}
            for (const [value, count] of filter.options) {
                options[value] ??= 0
                options[value] += count
            }
            // Cast back to list and sort alphabetically
            filter.options = Object.entries(options).sort((a, b) => a[0].localeCompare(b[0], this.store.lang))
        }

        this.notify()
    }

    /** Recursive helper for `updateData` */
    private collectAndSum(
        attrs: string[],
        elements: RecursiveRecord<number>,
        parentSelected: boolean
    ): [number, boolean] {
        const [attrInit, ...attrTail] = attrs
        const filter = this.filters[attrInit]
        let sum = 0
        let include = false

        for (const value in elements) {
            let childCount: number
            const child = elements[value]
            const selected = !filter.value.length || filter.value.includes(value)

            // filter out any parent values that do not support the child values
            include = include || selected

            if (typeof child == "number") {
                childCount = child
                include = true
            } else {
                ;[childCount, include] = this.collectAndSum(attrTail, child, parentSelected && selected)
            }

            const countDisplay = include && parentSelected ? childCount : 0
            filter.options.push([value, countDisplay])

            if (selected && include) sum += childCount
        }

        return [sum, include]
    }

    /** Build globally available CQP fragment. */
    getCqp() {
        // Create a token with an AND of each attribute, and an OR of the selected values of each attribute.
        const and_block = Object.entries(this.filters)
            .map(([attr, filter]) => filter.value.map((value) => this.createCondition(filter.attribute, value)))
            .filter((conds) => conds.length > 0)
        return and_block.length ? [{ and_block }] : undefined
    }

    private createCondition(attr: Attribute, value: string): Condition {
        const op = attr.type === "set" ? "contains" : "="
        return { type: `_.${attr.name}`, op, val: regescape(value) }
    }

    private notify() {
        this.listeners.forEach((callback) => callback())
    }
}
