/** @format */
import { Attribute } from "@/settings/config.types"
import { IScope } from "angular"

export type GlobalFilterService = {
    registerScope: (scope: UpdateScope) => void
    valueChange: () => void
}

export type DataObject = Record<string, FilterValuesItem>

export type FilterValuesItem = {
    attribute: Attribute
    value: string[]
    options: [string, number][]
}

export type UpdateScope = IScope & {
    update: (dataObj: DataObject) => void
}
