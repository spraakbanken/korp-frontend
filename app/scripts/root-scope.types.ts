/** @format */
import { IRootScopeService } from "angular"
import { TaskBase } from "@/backend/task/task-base"

/**
 * Extends the Angular Root Scope interface with properties used by this app.
 *
 * Note that the Store service is also using the root scope to store properties, but those are covered by the Store type.
 */
export type RootScope = IRootScopeService & DynamicTabs

export type DynamicTabs = {
    compareTabs: TaskBase[]
    graphTabs: TaskBase[]
    kwicTabs: TaskBase[]
    mapTabs: TaskBase[]
    textTabs: TaskBase[]
}
