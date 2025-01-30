/** @format */
import { Filter } from "@/corpus_listing"
import { IScope } from "angular"

export type GlobalFilterService = {
    registerScope: (scope: UpdateScope) => void
    valueChange: () => void
}

export type DataObject = Record<string, Filter & FilterValuesItem>

export type FilterValuesItem = {
    value: string[]
    possibleValues: [string, number][]
}

export type UpdateScope = IScope & {
    update: (dataObj: DataObject) => void
}
