/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import { AbsRelTuple, AjaxSettings, Granularity, Histogram, KorpResponse, NumericString } from "@/backend/types"
import { Factory, httpConfAddMethod } from "@/util"

export class GraphProxy extends BaseProxy<KorpCountTimeResponse> {
    granularity: Granularity
    prevParams: KorpCountTimeParams | null
    prevRequest: AjaxSettings

    constructor() {
        super()
        this.prevParams = null
    }

    expandSubCqps(subArray: string[]): Record<`subcqp${number}`, string> {
        const padding = _.fill(new Array(subArray.length.toString().length), "0")
        const result: Record<`subcqp${number}`, string> = {}
        for (let i = 0; i < subArray.length; i++) {
            const cqp = subArray[i]
            const p = padding.slice(i.toString().length).join("")
            result[`subcqp${p}${i}`] = cqp
        }
        return result
    }

    makeRequest(
        cqp: string,
        subcqps: string[],
        corpora: string,
        from: NumericString,
        to: NumericString
    ): JQuery.Promise<KorpResponse<KorpCountTimeResponse>> {
        this.resetRequest()
        const self = this
        const params: KorpCountTimeParams = {
            cqp: this.expandCQP(cqp),
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
        const def = $.Deferred()

        const ajaxSettings: AjaxSettings = {
            url: settings.korp_backend_url + "/count_time",
            dataType: "json",
            data: params,

            beforeSend: (req, settings) => {
                this.prevRequest = settings
                this.addAuthorizationHeader(req)
            },

            progress: (data, e) => {
                const progressObj = this.calcProgress(e)
                if (progressObj == null) {
                    return
                }
                def.notify(progressObj)
            },

            error(jqXHR, textStatus, errorThrown) {
                def.reject(textStatus)
            },
            success(data: KorpResponse<KorpCountTimeResponse>) {
                def.resolve(data)
                self.cleanup()
            },
        }

        $.ajax(httpConfAddMethod(ajaxSettings))

        return def.promise()
    }
}

const graphProxyFactory = new Factory(GraphProxy)
export default graphProxyFactory

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1count_time/get */
type KorpCountTimeParams = {
    corpus: string
    cqp: string
    default_within?: string
    with?: string
    [subcqpn: `subcqp${number}`]: string
    granularity?: Granularity
    from?: NumericString
    to?: NumericString
    strategy?: 1 | 2 | 3
    per_corpus?: boolean
    combined?: boolean
    [cqpn: `cqp${number}`]: string
    expand_prequeries?: boolean
    incremental?: boolean
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1count_time/get */
export type KorpCountTimeResponse = {
    corpora: Record<string, KorpGraphStats | (KorpGraphStats | KorpGraphStatsCqp)[]>
    combined: KorpGraphStats | (KorpGraphStats | KorpGraphStatsCqp)[]
}

export type KorpGraphStats = {
    absolute: Histogram
    relative: Histogram
    sums: AbsRelTuple
}

/** Stats contains subquery if graph was created with multiple rows selected in the stats table. */
export type KorpGraphStatsCqp = KorpGraphStats & { cqp: string }
