/** @format */
import { IRootScopeService } from "angular"
import { CompareTask } from "@/backend/task/compare-task"
import { ExampleTask } from "@/backend/task/example-task"
import { MapTask } from "@/backend/task/map-task"
import { TextTask } from "@/backend/task/text-task"
import { TrendTask } from "@/backend/task/trend-task"
import { WordpicExampleTask } from "./backend/task/wordpic-example-task"

/**
 * Extends the Angular Root Scope interface with properties used by this app.
 *
 * Note that the Store service is also using the root scope to store properties, but those are covered by the Store type.
 */
export type RootScope = IRootScopeService & DynamicTabs

export type DynamicTabs = {
    compareTabs: CompareTask[]
    graphTabs: TrendTask[]
    kwicTabs: (ExampleTask | WordpicExampleTask)[]
    mapTabs: MapTask[]
    textTabs: TextTask[]
}
