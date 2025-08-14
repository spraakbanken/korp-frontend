/** @format */
import settings from "@/settings"
import ProxyBase from "@/backend/proxy-base"
import { Factory } from "@/util"
import { RelationsParams, RelationsResponse, RelationsSort } from "./types/relations"

export type LemgramProxyInput = [string, string, RelationsSort]

export class LemgramProxy extends ProxyBase<"relations", LemgramProxyInput, RelationsResponse> {
    protected readonly endpoint = "relations"
    prevParams?: RelationsParams

    buildParams(word: string, type: string, sort: RelationsSort): RelationsParams {
        const params = {
            word,
            corpus: settings.corpusListing.stringifySelected(),
            incremental: true,
            type,
            sort,
            max: 1000,
        }
        this.prevParams = params
        return params
    }

    protected processResult(response: RelationsResponse): RelationsResponse {
        return response
    }
}

const lemgramProxyFactory = new Factory(LemgramProxy)
export default lemgramProxyFactory
