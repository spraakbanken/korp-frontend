/** @format */
import statsProxyFactory, { StatsProxy } from "@/backend/stats-proxy"
import settings from "@/settings"
import { type ParallelCorpusListing } from "./corpus_listing"

class ParallelStatsProxy extends StatsProxy {
    makeParameters(reduceVals: string[], cqp: string, ignoreCase: boolean) {
        let params = super.makeParameters(reduceVals, cqp, ignoreCase)
        const corpusListing = settings.corpusListing as ParallelCorpusListing
        params.within = corpusListing.getAttributeQuery("within").replace(/\|.*?:/g, ":")
        return params
    }
}

statsProxyFactory.setClass(ParallelStatsProxy)
