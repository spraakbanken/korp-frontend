/** @format */
import settings from "@/settings"
import ProxyBase from "@/backend/proxy-base"
import { Factory } from "@/util"
import { RelationsParams, RelationsSort } from "./types/relations"

export class LemgramProxy extends ProxyBase<"relations"> {
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

    makeRequest(word: string, type: string, sort: RelationsSort): Promise<any> {
        const params = this.buildParams(word, type, sort)
        return this.send(params)
    }
}

const lemgramProxyFactory = new Factory(LemgramProxy)
export default lemgramProxyFactory
