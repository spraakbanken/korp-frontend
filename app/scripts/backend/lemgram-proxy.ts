/** @format */
import settings from "@/settings"
import Abortable from "@/backend/base-proxy"
import type { ProgressHandler } from "@/backend/types"
import { Factory } from "@/util"
import { RelationsParams, RelationsResponse, RelationsSort } from "./types/relations"
import { korpRequest } from "./common"

export class LemgramProxy extends Abortable {
    prevParams?: RelationsParams

    async makeRequest(
        word: string,
        type: string,
        sort: RelationsSort,
        onProgress: ProgressHandler<"relations">
    ): Promise<RelationsResponse> {
        this.abort()

        const params = {
            word,
            corpus: settings.corpusListing.stringifySelected(),
            incremental: true,
            type,
            sort,
            max: 1000,
        }
        this.prevParams = params

        const abortSignal = this.getAbortSignal()
        return korpRequest("relations", params, { abortSignal, onProgress })
    }
}

const lemgramProxyFactory = new Factory(LemgramProxy)
export default lemgramProxyFactory
