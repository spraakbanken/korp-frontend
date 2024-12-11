/** @format */
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import type { Response, ProgressReport } from "@/backend/types"
import { Factory, httpConfAddMethod } from "@/util"
import { AjaxSettings } from "@/jquery.types"

export class LemgramProxy extends BaseProxy<KorpRelationsResponse> {
    prevParams?: KorpRelationsParams
    prevUrl?: string

    makeRequest(
        word: string,
        type: string,
        callback: (data: ProgressReport<KorpRelationsResponse>) => void
    ): JQuery.jqXHR<Response<KorpRelationsResponse>> {
        this.resetRequest()
        const self = this

        const params = {
            word,
            corpus: settings.corpusListing.stringifySelected(),
            incremental: true,
            type,
            max: 1000,
        }
        this.prevParams = params

        const ajaxSettings: AjaxSettings = {
            url: settings.korp_backend_url + "/relations",
            data: params,

            success() {
                self.cleanup()
            },

            progress(data, e) {
                const progressObj = self.calcProgress(e)
                if (progressObj == null) {
                    return
                }
                return callback(progressObj)
            },

            beforeSend(req, settings) {
                self.addAuthorizationHeader(req)
                self.prevUrl = settings.url
            },
        }

        const def = $.ajax(httpConfAddMethod(ajaxSettings)) as JQuery.jqXHR<Response<KorpRelationsResponse>>
        this.pendingRequests.push(def)
        return def
    }
}

const lemgramProxyFactory = new Factory(LemgramProxy)
export default lemgramProxyFactory

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Word-Picture */
type KorpRelationsParams = {
    corpus: string
    word: string
    type?: string
    min?: number
    max?: number
    incremental?: boolean
}

export type KorpRelationsResponse = {
    relations: ApiRelation[]
    /** Execution time in seconds */
    time: number
}

export type ApiRelation = {
    dep: string
    depextra: string
    deppos: string
    freq: number
    head: string
    headpos: string
    /** Lexicographer's mutual information score */
    mi: number
    rel: string
    /** List of IDs, for getting the source sentences */
    source: string[]
}
