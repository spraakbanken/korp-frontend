/** @format */
import * as _ from "lodash"
import { StatsData, RowsEntity, InnerData, Value } from "./interfaces/stats"

// function mergeSubResults(absolute, relative) {
//     const res_list = []
//     for (let { value: value1, freq: abs_freq } of absolute) {
//         const remove_idxs = []
//         for (let idx = 0; idx < relative.length; idx++) {
//             const { value: value2, freq: rel_freq } = relative[idx]
//             const val1 = _.values(value1)[0][0]
//             const val2 = _.values(value2)[0][0]
//             if (val1 === val2) {
//                 res_list.push({ value: val1, abs_freq, rel_freq })
//                 remove_idxs.push(idx)
//             }
//         }
//         const removed_elems = _.pullAt(relative, remove_idxs)
//     }
//     return res_list
// }

// function createResult(subResult, cqp, label) {
//     const points = []
//     _.map(mergeSubResults(subResult.absolute, subResult.relative), actual_hit => {
//         const hit = actual_hit.value
//         if (hit === "" || hit.startsWith(" ")) {
//             return
//         }
//         const [name, countryCode, lat, lng] = hit.split(";")

//         return points.push({
//             abs: actual_hit.abs_freq,
//             rel: actual_hit.rel_freq,
//             name,
//             countryCode,
//             lat: parseFloat(lat),
//             lng: parseFloat(lng)
//         })
//     })

//     return {
//         label,
//         cqp,
//         points
//     }
// }

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
            rel: row.relative
        })
    }
    return points
}

export function parseMapData(data: StatsData, cqp, cqpExprs): MapResult[] {
    console.log("parseMapData(data, cqp, cqpExprs", data, cqp, cqpExprs)
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
            points: getPointsFromObj(res)
        })
    }
    // }
    return result
}
