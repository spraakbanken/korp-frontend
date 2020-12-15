/** @format */
import * as _ from "lodash"
import { StatsData, InnerData } from "./interfaces/stats"

interface Point {
    abs: number
    rel: number
    name: string
    countryCode: string
    lat: number
    lng: number
}
interface MapResult {
    label: string
    cqp: string
    points: Point[]
}

function getPointsFromObj(obj: InnerData): Point[] {
    let points: Point[] = []
    for (let row of obj.rows) {
        const value = _.values(row.value)[0][0]
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

export function parseMapData(data: StatsData, cqp, cqpExprs): MapResult[] {
    const { combined, count } = data

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
