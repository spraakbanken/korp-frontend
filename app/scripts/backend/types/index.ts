/** @format */
import { API } from "./api"
import { Response } from "./common"

export * from "./common"
export * from "./api"

export type ProgressReport<K extends keyof API> = {
    /** Response data */
    data: Partial<Response<API[K]["response"]>>
    /** How many percent of the material has been searched. */
    percent: number
    /** How many search hits so far. */
    hits: number | null
}

export type ProgressHandler<K extends keyof API = keyof API> = (report: ProgressReport<K>) => void
