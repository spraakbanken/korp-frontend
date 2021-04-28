model.StatsProxy = class ParallelStatsProxy extends model.StatsProxy {
    makeParameters(reduceVals, cqp, ignoreCase) {
        let params = super.makeParameters(reduceVals, cqp, ignoreCase)
        params.within = settings.corpusListing.getAttributeQuery("within").replace(/\|.*?:/g, ":")
        return params
    }

}