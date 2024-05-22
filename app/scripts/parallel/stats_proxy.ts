/** @format */
import statsProxyFactory, { StatsProxy } from "@/backend/stats-proxy"
import settings from "@/settings"

class ParallelStatsProxy extends StatsProxy {
    makeParameters(reduceVals: string[], cqp: string, ignoreCase: boolean) {
        let params = super.makeParameters(reduceVals, cqp, ignoreCase)
        params.within = settings.corpusListing.getAttributeQuery("within").replace(/\|.*?:/g, ":")
        return params
    }
}

statsProxyFactory.setClass(ParallelStatsProxy)
