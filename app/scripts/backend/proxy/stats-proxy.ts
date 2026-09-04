import settings from "@/settings"
import { Factory } from "@/util"
import { CountParams, CountsMerged } from "../types/count"
import ProxyBase from "./proxy-base"
import { expandCqp } from "@/cqp_parser/cqp"
import { AttributeOption } from "@/corpora/corpus-set"
import { corpusSelection } from "@/corpora/corpus_listing"

export type StatsProxyInput = [string, string[], string | undefined, boolean | undefined]

export class StatsProxy extends ProxyBase<"count"> {
    protected readonly endpoint = "count"
    /** This is needed so that the statistics view will know what the original LINKED corpora was in parallel */
    originalCorpora: string = ""
    /** Percentage of selected materials that do not support selected attributes */
    unsupportedRatio: number = 0
    /** Attributes that are not supported by all selected corpora */
    unsupportedAttributes: AttributeOption[] = []

    protected buildParams(cqp: string, attrs: string[], defaultWithin?: string, ignoreCase?: boolean): CountParams {
        // Get selected attribute options
        const options = corpusSelection
            .getAttributeGroupsStatistics()
            .filter((option) => attrs.includes(option.name) && option.name != "word")

        // Assert that all attrs were recognized
        const missingAttrs = attrs.filter((name) => !options.find((attr) => attr.name == name) && name != "word")
        if (missingAttrs.length) throw new Error(`Trying to reduce by missing attribute ${missingAttrs}`)

        // Calculate size of selected corpora that do not support all attributes
        const unsupportedCorpora = corpusSelection.getUnsupportedCorpora(options)
        this.unsupportedRatio = unsupportedCorpora.corpora.length
            ? unsupportedCorpora.getTokenCount() / corpusSelection.getTokenCount()
            : 0

        // Get names of not-fully-supported attributes
        this.unsupportedAttributes = options.filter((option) => option.unsupported.length)

        // Use only corpora that support all attributes
        const supportedCorpora = corpusSelection.getIds().filter((id) => !unsupportedCorpora.getIds().includes(id))
        if (!supportedCorpora.length) throw new NoSupportedCorporaError()
        const corpora = corpusSelection.pick(supportedCorpora)

        // this is needed so that the statistics view will know what the original LINKED corpora was in parallel
        this.originalCorpora = corpora.stringify(false)

        const [groupByStruct, groupBy] = corpora.partitionAttrs(attrs)

        let within = corpora.getWithinParam(defaultWithin)
        // Replace "ABC-aa|ABC-bb:link" with "ABC-aa:link"
        if (settings.parallel) within = within?.replace(/\|.*?:/g, ":")

        const split = options.filter((option) => option.type == "set").map((option) => option.name)
        // For ranked attributes, only count the top-ranking value in a token.
        const top = options.filter((option) => option.ranked).map((option) => option.name)

        const params: CountParams = {
            group_by: groupBy.join(),
            group_by_struct: groupByStruct.join(),
            cqp: expandCqp(cqp),
            corpus: corpora.stringify(true),
            end: settings["statistics_limit"] ? settings["statistics_limit"] - 1 : undefined,
            ignore_case: ignoreCase ? "word" : undefined,
            incremental: true,
            split: split.join(),
            top: top.join(),
            default_within: defaultWithin,
            within,
        }

        return params
    }

    async makeRequest(
        cqp: string,
        attrs: string[],
        defaultWithin?: string,
        ignoreCase?: boolean,
    ): Promise<CountsMerged> {
        const params = this.buildParams(cqp, attrs, defaultWithin, ignoreCase)
        // We know it's the merged type, not split, because we are not using `subcqp{N}` params.
        return (await this.send(params)) as CountsMerged
    }
}

const statsProxyFactory = new Factory(StatsProxy)
export default statsProxyFactory

export class NoSupportedCorporaError extends Error {
    constructor() {
        super("No selected corpus supports all chosen attributes")
        this.name = "NoSupportedCorporaError"
    }
}
