/** @format */
import _ from "lodash"
import BaseProxy from "@/backend/base-proxy"
import { Granularity, NumericString, ProgressHandler } from "@/backend/types"
import { Factory } from "@/util"
import { CountTimeParams, CountTimeResponse } from "./types/count-time"
import { korpRequest } from "./common"
import { expandCqp } from "@/cqp_parser/cqp"

export class GraphProxy extends BaseProxy {
    granularity: Granularity
    prevParams: CountTimeParams | null

    constructor() {
        super()
        this.prevParams = null
    }

    expandSubCqps(subArray: string[]): Record<`subcqp${string}`, string> {
        const padding = _.fill(new Array(subArray.length.toString().length), "0")
        const result: Record<`subcqp${string}`, string> = {}
        for (let i = 0; i < subArray.length; i++) {
            const cqp = subArray[i]
            const p = padding.slice(i.toString().length).join("")
            result[`subcqp${p}${i}`] = cqp
        }
        return result
    }

    async makeRequest(
        cqp: string,
        subcqps: string[],
        corpora: string,
        from: NumericString,
        to: NumericString,
        onProgress: ProgressHandler<"count_time">
    ): Promise<CountTimeResponse> {
        this.resetRequest()
        const abortSignal = this.abortController.signal

        const params: CountTimeParams = {
            cqp: expandCqp(cqp),
            corpus: corpora,
            granularity: this.granularity,
            incremental: true,
            per_corpus: false,
        }

        if (from) {
            params.from = from
        }
        if (to) {
            params.to = to
        }

        // TODO: fix this for struct attrs
        _.extend(params, this.expandSubCqps(subcqps))
        this.prevParams = params

        return await korpRequest("count_time", params, { abortSignal, onProgress })
    }
}

const graphProxyFactory = new Factory(GraphProxy)
export default graphProxyFactory
