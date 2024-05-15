/** @format */
import settings from "@/settings"
import BaseProxy, { AjaxSettings } from "@/korp-api/base-proxy"
import { httpConfAddMethod } from "@/util"

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Word-Picture */
type KorpRelationsParams = {
    corpus: string
    word: string
    type?: string
    min?: number
    max?: number
    incremental?: boolean
}

export default class LemgramProxy extends BaseProxy {
    prevParams?: KorpRelationsParams
    prevRequest?: JQuery.AjaxSettings
    prevUrl?: string

    makeRequest(word: string, type: string, callback) {
        super.makeRequest()
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

        const def = $.ajax(httpConfAddMethod(ajaxSettings))
        this.pendingRequests.push(def)
        return def
    }
}
