/** @format */
import { Filter } from "@/corpus_listing"
import { IScope } from "angular"

export type GlobalFilterService = {
    registerScope: (scope: UpdateScope) => void
    valueChange: () => void
}

export type DataObject = {
    /** Whether to show the filter controls. */
    showDirective: boolean
    /** Names of attributes to use filters for */
    defaultFilters: string[]
    /** Filter settings for each attribute */
    attributes: Record<string, Filter>
    /** Selected values for each filter. */
    filterValues: Record<string, FilterValuesItem>
}

export type FilterValuesItem = {
    value: string[]
    possibleValues: [string, number][]
}

export type UpdateScope = IScope & {
    update: (dataObj: DataObject) => void
}
