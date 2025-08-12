/** @format */
import { IRootScopeService } from "angular"
import { CorpusListing } from "./corpus_listing"
import { CompareTask } from "@/backend/compare-task"
import { ExampleTask } from "@/backend/example-task"
import { MapTask } from "@/backend/map-task"

/** Extends the Angular Root Scope interface with properties used by this app. */
export type RootScope = IRootScopeService & {
    compareTabs: CompareTask[]
    graphTabs: GraphTab[]
    kwicTabs: ExampleTask[]
    mapTabs: MapTask[]
    textTabs: TextTab[]
}

export type DynamicTabName = "compareTabs" | "graphTabs" | "kwicTabs" | "mapTabs" | "textTabs"

export type GraphTab = {
    cqp: string
    subcqps: string[]
    labelMapping: Record<string, string>
    showTotal: boolean
    corpusListing: CorpusListing
}

export type TextTab = {
    corpus: string
    sentenceData: Record<string, string>
}
