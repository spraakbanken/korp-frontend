/** @format */
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import type { Response, ProgressReport } from "@/backend/types"
import { ajaxConfAddMethod, Factory } from "@/util"
import { AjaxSettings } from "@/jquery.types"
import { RelationsParams, RelationsResponse } from "./types/relations"

export class LemgramProxy extends BaseProxy<"relations"> {
    prevParams?: RelationsParams
    prevUrl?: string

    makeRequest(
        word: string,
        type: string,
        callback: (data: ProgressReport<"relations">) => void
    ): JQuery.jqXHR<Response<RelationsResponse>> {
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

        const ajaxSettings = {
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
        } satisfies AjaxSettings

        const def = $.ajax(ajaxConfAddMethod(ajaxSettings)) as JQuery.jqXHR<Response<RelationsResponse>>
        this.pendingRequests.push(def)
        return def
    }
}

const lemgramProxyFactory = new Factory(LemgramProxy)
export default lemgramProxyFactory
