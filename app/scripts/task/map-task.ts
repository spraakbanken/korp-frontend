import { MarkerGroup, Point } from "@/statistics/map"
import { corpusListing } from "@/corpora/corpus_listing"
import { CountParams, StatsRow } from "../backend/types/count"
import { korpRequest } from "../backend/common"
import { compact } from "lodash"
import { TaskBase } from "./task-base"

export type MapAttribute = { label: string; corpora: string[] }

export type MapSeries = {
    label: string
    cqp: string
    points: Point[]
}

export class MapTask extends TaskBase<MapSeries[]> {
    data: MapSeries[]

    constructor(
        readonly cqp: string,
        readonly cqpExprs: Record<string, string>,
        readonly label: string,
        readonly corpora: string[],
        readonly within?: string,
        readonly relative?: boolean,
    ) {
        super()
    }

    async send(): Promise<MapSeries[]> {
        const cl = corpusListing.subsetFactory(this.corpora)
        const within = cl.getWithinParam(this.within)

        const params: CountParams = {
            group_by_struct: this.label,
            cqp: this.cqp,
            corpus: this.corpora.join(","),
            incremental: true,
            split: this.label,
            relative_to_struct: this.relative ? this.label : undefined,
            default_within: this.within,
            within,
        }

        Object.keys(this.cqpExprs).forEach((cqp, i) => (params[`subcqp${i}`] = cqp))

        const data = await korpRequest("count", params)

        // Normalize data to the split format.
        const combined = Array.isArray(data.combined) ? data.combined : [data.combined]
        // If multiple series, ignore the totals.
        if (combined.length > 1) combined.shift()

        this.data = combined.map((res) => ({
            // The totals row has no `cqp` property.
            label: res.cqp ? this.cqpExprs[res.cqp] : "Σ",
            cqp: res.cqp || this.cqp,
            points: compact(res.rows.map(this.getPoint)),
        }))

        return this.data
    }

    getPoint(row: StatsRow): Point | undefined {
        const value = Object.values(row.value)[0][0]
        if (!value) return
        const [name, countryCode, lat, lng] = value.split(";")
        return {
            name,
            countryCode,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            abs: row.absolute,
            rel: row.relative,
        }
    }

    getMarkerGroups(newColor: () => string): Record<string, MarkerGroup> {
        const groups = Object.fromEntries(
            this.data.map((series, idx) => {
                const markers = Object.fromEntries(
                    series.points.map((point, pointIdx) => {
                        // Include point index in the key, so that multiple
                        // places with the same name but different coordinates
                        // each get their own markers
                        const id = [point.name.replace(/-/g, ""), pointIdx.toString(), idx].join(":")
                        const marker = {
                            lat: point.lat,
                            lng: point.lng,
                            queryData: {
                                searchCqp: this.cqp,
                                subCqp: series.cqp,
                                label: this.label,
                                corpora: this.corpora,
                                within: this.within,
                            },
                            label: series.label,
                            point,
                        }
                        return [id, marker]
                    }),
                )

                const group = {
                    selected: true,
                    order: idx,
                    color: newColor(),
                    markers,
                }
                return [series.label, group]
            }),
        )
        return groups
    }
}
