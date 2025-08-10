/** @format */
import L from "leaflet"
import { html } from "@/util"
import { MapRequestResult } from "@/backend/backend"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { CountsSplit, StatsColumn } from "@/backend/types/count"

export type MarkerGroup = {
    selected: boolean
    order: number
    color: string
    markers: Record<string, Marker>
}

export type Marker = MarkerEvent & {
    lat: number
    lng: number
    label: string
}

export type MarkerEvent = {
    point: Point
    queryData: MarkerQueryData
}

export type MapResult = {
    label: string
    cqp: string
    points: Point[]
}

/** Needed for making a sub-search */
export type MarkerQueryData = {
    searchCqp: string
    subCqp: string
    label: string
    corpora: string[]
    within?: string
}

export type CustomMarker = L.Marker & {
    markerData: MarkerData
}

export type CustomMarkerMany = L.Marker & {
    markerData: MarkerData[]
}

export type MarkerData = MarkerEvent & {
    label: string
    color: string
}

export type MergedMarker = {
    markerData: MarkerData[]
    lat: number
    lng: number
}

export class MarkerClusterGroup extends L.MarkerClusterGroup {
    getAllChildMarkers: () => CustomMarker[]
}

export class MarkerCluster extends L.MarkerCluster {
    getAllChildMarkers: () => CustomMarker[]
}

/** Determine if a given layer is a single marker */
export const isMarker = <T extends L.Layer>(layer: T | CustomMarker): layer is CustomMarker => "markerData" in layer

/** Determine if a given layer is a cluster marker */
export const isMarkerCluster = <T extends L.Layer>(layer: T | MarkerClusterGroup): layer is MarkerClusterGroup =>
    "getChildCount" in layer

type Point = {
    abs: number
    rel: number
    name: string
    countryCode: string
    lat: number
    lng: number
}

export type MapAttributeOption = {
    label: string
    corpora: string[]
    selected?: boolean
}

export function getGeoAttributes(corpora: CorpusTransformed[]) {
    const attrs: Record<string, MapAttributeOption> = {}
    for (const corpus of corpora) {
        for (const attr of corpus.private_struct_attributes) {
            if (attr.indexOf("geo") !== -1) {
                if (attrs[attr]) {
                    attrs[attr].corpora.push(corpus.id)
                } else {
                    attrs[attr] = {
                        label: attr,
                        corpora: [corpus.id],
                    }
                }
            }
        }
    }

    const attributes = Object.values(attrs)
    // Select first attribute
    if (attributes.length) attributes[0].selected = true
    return attributes
}

export function parseMapData(data: CountsSplit, cqp: string, cqpExprs: Record<string, string>): MapResult[] {
    const { combined } = data

    let result: MapResult[] = []
    let ignoreTotal = combined.length > 1

    for (let res of combined) {
        let label = res.cqp ? cqpExprs[res.cqp] : "Σ"
        let isTotal = !res.cqp
        if (isTotal && ignoreTotal) {
            continue
        }
        result.push({
            label: label,
            cqp: res.cqp || cqp,
            points: getPointsFromObj(res),
        })
    }
    return result
}

function getPointsFromObj(obj: StatsColumn): Point[] {
    let points: Point[] = []
    for (const row of obj.rows || []) {
        const value = Object.values(row.value)[0][0]
        if (!value) {
            continue
        }
        const [name, countryCode, lat, lng] = value.split(";")
        points.push({
            name,
            countryCode,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            abs: row.absolute,
            rel: row.relative,
        })
    }
    return points
}

export function getMarkerGroups(result: MapRequestResult, newColor: () => string): Record<string, MarkerGroup> {
    const groups = result.data.reduce((groups, res, idx) => {
        const markers = getMarkers(result.attribute.label, result.cqp, result.corpora, result.within, res, idx)
        const group = {
            selected: true,
            order: idx,
            color: newColor(),
            markers,
        }
        return { ...groups, [res.label]: group }
    }, {} as Record<string, MarkerGroup>)
    return groups
}

function getMarkers(
    label: string,
    cqp: string,
    corpora: string[],
    within: string | undefined,
    res: MapResult,
    idx: number
): Record<string, Marker> {
    return Object.fromEntries(
        res.points.map((point, pointIdx) => {
            // Include point index in the key, so that multiple
            // places with the same name but different coordinates
            // each get their own markers
            const id = [point.name.replace(/-/g, ""), pointIdx.toString(), idx].join(":")
            const marker = {
                lat: point.lat,
                lng: point.lng,
                queryData: {
                    searchCqp: cqp,
                    subCqp: res.cqp,
                    label,
                    corpora,
                    within,
                },
                label: res.label,
                point,
            }
            return [id, marker]
        })
    )
}

export function createCircleMarker(color: string, diameter: number, borderRadius: number) {
    return L.divIcon({
        html: html`<div
            class="geokorp-marker"
            style="border-radius:${borderRadius}px; height:${diameter}px; background-color:${color}"
        ></div>`,
        iconSize: new L.Point(diameter, diameter),
    })
}

/**
 * Organizes several markers at the same location in a 2D grid.
 * Like:
 *    o
 *   oOo
 */
export function createMultiMarkerIcon(markerData: MarkerData[], maxRel: number) {
    const elements = markerData.map((marker) => {
        const diameter = (marker.point.rel / maxRel) * 40 + 10
        return [
            diameter,
            html`<div
                class="geokorp-multi-marker"
                style="border-radius:${diameter}px; height:${diameter}px; width:${diameter}px; background-color:${marker.color}"
            ></div>`,
        ] as [number, string]
    })

    elements.sort((a, b) => a[0] - b[0])

    const gridSizeRaw = Math.ceil(Math.sqrt(elements.length)) + 1
    const gridSize = gridSizeRaw % 2 === 0 ? gridSizeRaw + 1 : gridSizeRaw
    const center = Math.floor(gridSize / 2)

    const gridRaw: ([number, string][] | [])[] = []
    for (let i = 0; i <= gridSize - 1; i++) gridRaw.push([])

    const id = (x: number) => x
    const neg = (x: number) => -x
    for (let idx = 0; idx <= center; idx++) {
        let x = -1
        let y = -1
        let xOp = neg
        let yOp = neg
        const stop = idx === 0 ? 0 : idx * 4 - 1
        for (let j = 0; j <= stop; ++j) {
            x = x === -1 ? center + idx : x + xOp(1)
            y = y === -1 ? center : y + yOp(1)
            if (x === center - idx) xOp = id
            if (y === center - idx) yOp = id
            if (x === center + idx) xOp = neg
            if (y === center + idx) yOp = neg
            const circle = elements.pop()
            if (circle) {
                gridRaw[y][x] = circle
            } else {
                break
            }
        }
    }
    // remove all empty arrays and elements
    // TODO don't create empty stuff??
    const grid = gridRaw.filter((row) => row.length > 0).map((row) => row.filter((elem) => elem))

    //# take largest element from each row and add to height
    let height = 0
    let width = 0
    const gridCenter = Math.floor(grid.length / 2)

    const rows = grid.map((row, idx) => {
        height += row.reduce((memo, val) => (val[0] > memo ? val[0] : memo), 0)
        if (idx === gridCenter) {
            width = grid[gridCenter].reduce((memo, val) => memo + val[0], 0)
        }
        const markerClass = idx === gridCenter ? "marker-middle" : idx > gridCenter ? "marker-top" : "marker-bottom"
        return html`<div class="${markerClass}" style="text-align:center; line-height:0;">
            ${row.map((elem) => elem[1]).join("")}
        </div>`
    })
    return L.divIcon({
        html: rows.join(""),
        iconSize: new L.Point(width, height),
    })
}
