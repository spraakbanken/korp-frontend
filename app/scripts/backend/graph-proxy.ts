/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import { Granularity, Response, NumericString } from "@/backend/types"
import { ajaxConfAddMethod, Factory } from "@/util"
import { AjaxSettings } from "@/jquery.types"
import { CountTimeParams, CountTimeResponse } from "./types/count-time"

export class GraphProxy extends BaseProxy<"count_time"> {
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

    makeRequest(
        cqp: string,
        subcqps: string[],
        corpora: string,
        from: NumericString,
        to: NumericString
    ): JQuery.Promise<Response<CountTimeResponse>> {
        this.resetRequest()
        const self = this
        const params: CountTimeParams = {
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

        const ajaxSettings = {
            url: settings.korp_backend_url + "/count_time",
            dataType: "json",
            data: params,

            beforeSend: (req) => {
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
            success(data: Response<CountTimeResponse>) {
                def.resolve(data)
                self.cleanup()
            },
        } satisfies AjaxSettings

        $.ajax(ajaxConfAddMethod(ajaxSettings))

        return def.promise()
    }
}

const graphProxyFactory = new Factory(GraphProxy)
export default graphProxyFactory
