import CSV from "comma-separated-values/csv"
import { downloadFile } from "./util"

export type CsvType = keyof typeof CSV_TYPES

export const CSV_TYPES = {
    comma: { delimiter: ",", ext: "csv", mime: "text/csv" },
    semi: { delimiter: ";", ext: "csv", mime: "text/csv" },
    tab: { delimiter: "\t", ext: "tsv", mime: "text/tab-separated-values" },
}

/** Create a CSV file and trigger a download */
export function downloadCsvFile(name: string, rows: Iterable<(string | number)[]>, type: CsvType) {
    const { delimiter, ext, mime } = CSV_TYPES[type]
    const csv = CSV.encode([...rows], { delimiter })
    downloadFile(csv, `korp-${name}.${ext}`, mime)
}
