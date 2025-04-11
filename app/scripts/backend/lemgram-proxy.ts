/** @format */
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import type { ProgressHandler } from "@/backend/types"
import { Factory } from "@/util"
import { RelationsParams, RelationsResponse } from "./types/relations"
import { korpRequest } from "./common"

export class LemgramProxy extends BaseProxy {
    prevParams?: RelationsParams

    async makeRequest(
        word: string,
        type: string,
        sort: RelationsParams["sort"],
        onProgress: ProgressHandler<"relations">
    ): Promise<RelationsResponse> {
        this.resetRequest()
        const abortSignal = this.abortController.signal

        const params = {
            word,
            corpus: settings.corpusListing.stringifySelected(),
            incremental: true,
            type,
            sort,
            max: 1000,
        }
        this.prevParams = params

        return korpRequest("relations", params, { abortSignal, onProgress })
    }
}

const lemgramProxyFactory = new Factory(LemgramProxy)
export default lemgramProxyFactory
