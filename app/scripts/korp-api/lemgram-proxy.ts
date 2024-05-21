/** @format */
import settings from "@/settings"
import BaseProxy from "@/korp-api/base-proxy"
import type { AjaxSettings, KorpResponse, ProgressCallback } from "@/korp-api/korp-api.types"
import { httpConfAddMethod } from "@/util"

export default class LemgramProxy extends BaseProxy {
    prevParams?: KorpRelationsParams
    prevRequest?: AjaxSettings
    prevUrl?: string

    makeRequest(
        word: string,
        type: string,
        callback: ProgressCallback
    ): JQuery.jqXHR<KorpResponse<KorpRelationsResponse>> {
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
            url: settings["korp_backend_url"] + "/relations",
            data: params,

            success() {
                self.prevRequest = params
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
                self.prevRequest = settings
                self.addAuthorizationHeader(req)
                self.prevUrl = self.makeUrlWithParams(this.url, params)
            },
        }

        const def = $.ajax(httpConfAddMethod(ajaxSettings)) as JQuery.jqXHR<KorpResponse<KorpRelationsResponse>>
        this.pendingRequests.push(def)
        return def
    }
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Word-Picture */
type KorpRelationsParams = {
    corpus: string
    word: string
    type?: string
    min?: number
    max?: number
    incremental?: boolean
}

type KorpRelationsResponse = {
    relations: ApiRelation[]
    /** Execution time in seconds */
    time: number
}

type ApiRelation = {
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
