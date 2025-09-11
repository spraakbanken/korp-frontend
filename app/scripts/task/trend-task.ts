import { CorpusSet } from "@/corpora/corpus-set"
import { NumericString, ProgressHandler } from "../backend/types"
import { GRANULARITIES, Level } from "@/trend-diagram/util"
import { Moment } from "moment"
import { padStart } from "lodash"
import { expandCqp } from "@/cqp_parser/cqp"
import { korpRequest } from "../backend/common"
import { CountTimeParams, CountTimeResponse } from "../backend/types/count-time"
import { TaskBase } from "./task-base"

export class TrendTask extends TaskBase<CountTimeResponse> {
    constructor(
        readonly cqp: string,
        readonly subqueries: [string, string][],
        readonly showTotal: boolean,
        readonly corpusListing: CorpusSet,
        readonly defaultWithin?: string,
    ) {
        super()
    }

    send(zoom: Level, from: Moment, to: Moment, onProgress: ProgressHandler<"count_time">) {
        this.abort()

        const formatDate = (d: Moment) => d.format("YYYYMMDDHHmmss") as NumericString

        const padLength = String(this.subqueries.length).length
        // TODO: fix this for struct attrs
        const subcqps = Object.fromEntries(
            this.subqueries.map(([cqp], i) => [`subcqp${padStart(String(i), padLength, "0")}`, cqp]),
        )

        const params: CountTimeParams = {
            cqp: expandCqp(this.cqp),
            default_within: this.defaultWithin,
            corpus: this.corpusListing.stringify(),
            granularity: GRANULARITIES[zoom],
            from: formatDate(from),
            to: formatDate(to),
            incremental: true,
            per_corpus: false,
            ...subcqps,
        }

        const abortSignal = this.getAbortSignal()
        return korpRequest("count_time", params, { abortSignal, onProgress })
    }
}
