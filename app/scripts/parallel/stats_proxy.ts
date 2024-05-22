/** @format */
import model from "@/backend/model"
import settings from "@/settings"

model.StatsProxy = class ParallelStatsProxy extends model.StatsProxy {
    makeParameters(reduceVals: string[], cqp: string, ignoreCase: boolean) {
        let params = super.makeParameters(reduceVals, cqp, ignoreCase)
        params.within = settings.corpusListing.getAttributeQuery("within").replace(/\|.*?:/g, ":")
        return params
    }
}
