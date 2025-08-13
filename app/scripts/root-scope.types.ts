/** @format */
import { IRootScopeService } from "angular"
import { CompareTask } from "@/backend/compare-task"
import { ExampleTask } from "@/backend/example-task"
import { MapTask } from "@/backend/map-task"
import { TextTask } from "@/backend/text-task"
import { TrendTask } from "@/backend/trend-task"

/**
 * Extends the Angular Root Scope interface with properties used by this app.
 *
 * Note that the Store service is also using the root scope to store properties, but those are covered by the Store type.
 */
export type RootScope = IRootScopeService & DynamicTabs

export type DynamicTabs = {
    compareTabs: CompareTask[]
    graphTabs: TrendTask[]
    kwicTabs: ExampleTask[]
    mapTabs: MapTask[]
    textTabs: TextTask[]
}
