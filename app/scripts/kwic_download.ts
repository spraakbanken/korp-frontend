/** @format */
import _ from "lodash"
import moment from "moment"
import CSV from "comma-separated-values/csv"
import { locObj } from "@/i18n"
import { type ApiKwic, type KorpQueryParams } from "@/backend/kwic-proxy"
import { LangMap } from "./i18n/types"

// This is what is returned by massageData in kwic.js
type Row = ApiKwic | LinkedKwic | CorpusHeading
// The annotations option is not available for parallel
type AnnotationsRow = ApiKwic | CorpusHeading

type LinkedKwic = {
    tokens: ApiKwic["tokens"]
    isLinked: true
    corpus: string
}

type CorpusHeading = {
    newCorpus: LangMap | string
    noContext?: boolean
}

const isKwic = (row: Row): row is ApiKwic => "tokens" in row && !isLinkedKwic(row)
const isLinkedKwic = (row: Row): row is LinkedKwic => "isLinked" in row
const isCorpusHeading = (row: Row): row is CorpusHeading => "newCorpus" in row

type TableRow = (string | number)[]

const emptyRow = (length: number) => _.fill(new Array(length), "")

const padRows = (data: string[], length: number) => _.map(data, (value) => [value, ...emptyRow(length - 1)])

function createFile(dataType: string, fileType: string, content: string) {
    const date = moment().format("YYYYMMDD_HHmmss")
    const filename = `korp_${dataType}_${date}.${fileType}`
    const blobURL = window.URL.createObjectURL(new Blob([content], { type: `text/${fileType}` }))
    return [filename, blobURL]
}

function createSearchInfo(requestInfo: KorpQueryParams, totalHits: number) {
    return [
        `## CQP query: ${requestInfo.cqp}`,
        `## context: ${requestInfo.default_context}`,
        `## within: ${requestInfo.default_within}`,
        `## sorting: ${requestInfo.sort || "none"}`,
        `## start: ${requestInfo.start}`,
        `## end: ${requestInfo.end}`,
        `## Total hits: ${totalHits}`,
    ]
}

function transformDataToAnnotations(data: AnnotationsRow[], searchInfo: string[]) {
    const firstTokensRow: ApiKwic = data.find((row) => isKwic(row)) as ApiKwic | undefined
    if (!firstTokensRow) return undefined

    const headers = Object.keys(firstTokensRow.tokens[0]).filter(
        (val) => val.indexOf("_") !== 0 && val !== "structs" && val !== "$$hashKey" && val !== "position"
    )

    const columnCount = headers.length + 1
    let corpus
    const res = padRows(searchInfo, columnCount)
    res.push(["match"].concat(headers))
    for (const row of data) {
        if (isKwic(row)) {
            const textAttributes = []
            for (let attrName in row.structs) {
                const attrValue = row.structs[attrName]
                textAttributes.push(attrName + ': "' + attrValue + '"')
            }
            const hitInfo = emptyRow(columnCount)
            hitInfo[0] = `# ${corpus}; text attributes: ${textAttributes.join(", ")}`
            res.push(hitInfo)

            for (let token of row.tokens || []) {
                let match = ""
                for (let matchObj of [row.match].flat()) {
                    if (token.position >= matchObj.start && token.position < matchObj.end) {
                        match = "***"
                        break
                    }
                }
                const newRow = [match]
                for (let field of headers) {
                    newRow.push(token[field])
                }
                res.push(newRow)
            }
        } else if (row.newCorpus) {
            corpus = locObj(row.newCorpus)
        }
    }

    return res
}

function transformDataToKWIC(data: Row[], searchInfo: string[]) {
    let corpus: string
    const structHeaders: string[] = []
    let res: TableRow[] = []
    for (const row of data) {
        if (isCorpusHeading(row)) {
            corpus = locObj(row.newCorpus)
        } else if (isKwic(row)) {
            var attrName, token
            const leftContext = []
            const match = []
            const rightContext = []

            if (row.match instanceof Array) {
                // the user has searched "not-in-order" and we cannot have a left, match and right context for the download
                // put all data in leftContext
                for (token of row.tokens) {
                    leftContext.push(token.word)
                }
            } else {
                for (token of row.tokens.slice(0, row.match.start)) {
                    leftContext.push(token.word)
                }
                for (token of row.tokens.slice(row.match.start, row.match.end)) {
                    match.push(token.word)
                }
                for (token of row.tokens.slice(row.match.end, row.tokens.length)) {
                    rightContext.push(token.word)
                }
            }

            const structs = []
            for (attrName in row.structs) {
                if (!structHeaders.includes(attrName)) {
                    structHeaders.push(attrName)
                }
            }
            for (attrName of structHeaders) {
                if (attrName in row.structs) {
                    structs.push(row.structs[attrName])
                } else {
                    structs.push("")
                }
            }
            const newRow: TableRow = [
                corpus,
                row.match instanceof Array ? row.match.map((match) => match.position).join(", ") : row.match.position,
                leftContext.join(" "),
                match.join(" "),
                rightContext.join(" "),
            ].concat(structs)
            res.push(newRow)
        } else {
            // parallell mode does not have matches or structs for the linked sentences
            // current wordaround is to add all tokens to the left context
            res.push(["", "", row.tokens.map((token) => token.word).join(" "), "", ""])
        }
    }

    const headers = ["corpus", "match_position", "left context", "match", "right_context"].concat(structHeaders)
    res = [headers, ...res]

    res.push(emptyRow(headers.length))
    for (let row of padRows(searchInfo, headers.length)) {
        res.push(row)
    }

    return res
}

function transformData(dataType: "annotations" | "kwic", data: Row[], requestInfo: KorpQueryParams, totalHits: number) {
    const searchInfo = createSearchInfo(requestInfo, totalHits)
    if (dataType === "annotations") {
        return transformDataToAnnotations(data as AnnotationsRow[], searchInfo)
    }
    if (dataType === "kwic") {
        return transformDataToKWIC(data, searchInfo)
    }
}

function makeContent(fileType: "csv" | "tsv", transformedData: TableRow[]): string {
    let dataDelimiter
    if (fileType === "csv") {
        dataDelimiter = ","
    }
    if (fileType === "tsv") {
        dataDelimiter = "\t"
    }

    const csv = new CSV(transformedData, {
        delimiter: dataDelimiter,
    })

    return csv.encode()
}

export function makeDownload(
    dataType: "annotations" | "kwic",
    fileType: "csv" | "tsv",
    data: Row[],
    requestInfo: KorpQueryParams,
    totalHits: number
) {
    const table = transformData(dataType, data, requestInfo, totalHits)
    const csv = makeContent(fileType, table)
    return createFile(dataType, fileType, csv)
}
