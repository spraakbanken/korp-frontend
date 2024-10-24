import { Visualizer } from "../../../lib/brat/client/src/visualizer.js"
import "../../../lib/brat/style-vis.css"
import "../../../lib/jquery.svg.js"
import "../../../lib/jquery.svgdom.js"

export default Visualizer as unknown as BratVisualizer;

// These type definitions are very incomplete and may be inaccurate.

export type BratDispatcher = {
    on: () => void
    post: () => void
}

export type BratVisualizer = {
    new (dispatcher: BratDispatcher, to_div: string)
    collectionLoaded: (collData: any) => void
    renderData: (docData: any) => void
}

export type BratEntity = [string, string, [number, number][]]
export type BratRelation = [string, string, [string, string][]]
export type BratType = {
    type: string,
    labels: string[],
    color?: string,
    bgColor?: string,
    borderColor?: string,
    args?: {role: string, targets: any[]}[]
}