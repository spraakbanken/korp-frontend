/** @format */

import angular, { IHttpPromise, IHttpService } from "angular"

const karpURL = "https://spraakbanken4.it.gu.se/karp/v7"

export type KarpService = {
    getLemgrams: (wordForm: string, morphologies: string[]) => IHttpPromise<KarpResponse<string>>
    getSenseId(lemgram: string): IHttpPromise<KarpResponse<string>>
    getSenses(lemgrams: string[]): IHttpPromise<KarpResponse<SaldoEntry>>
    getSwefnFrame(senses: string[]): IHttpPromise<KarpResponse<SwefnEntry>>
}

export type KarpResponse<T> = {
    total: number
    hits: T[]
    distribution: Record<string, number>
}

export type SaldoEntry = {
    senseID: string
    primary: string
    // There's more, but not used here
}

export type SwefnEntry = {
    swefnID: string
    LUs: string[]
    // There's more, but not used here
}

/** Query for saldom resource to find all entries that have wf as a non-compound word form */
const wfQuery = (wf: string) =>
    `inflectionTable(and(equals|writtenForm|${wf}||not(equals|msd|c||equals|msd|ci||equals|msd|cm||equals|msd|sms)))`

/** Create a query condition for a field matching any of several values */
const equals = (field: string, values: string[]) =>
    `or(${values.map((value) => `equals|${field}|${value}`).join("||")})`

angular.module("korpApp").factory("karp", [
    "$http",
    function ($http: IHttpService): KarpService {
        /** Query lexicons in the Karp API */
        const query = <T>(lexicons: string[], q: string, path: string, params?: object) =>
            $http<KarpResponse<T>>({
                method: "GET",
                url: `${karpURL}/query/${lexicons.join(",")}`,
                params: { q, path, ...params },
            })

        return {
            getLemgrams: (wordForm, morphologies) =>
                query(morphologies, wfQuery(wordForm), "entry.lemgram", { size: 100 }),

            getSenseId: (lemgram) => query(["saldo"], `equals|lemgrams|${lemgram}`, "entry.senseID"),

            getSenses: (lemgrams) => query(["saldo"], equals("lemgrams", lemgrams), "entry", { size: 500 }),

            getSwefnFrame: (senses) => query(["swefn"], equals("LUs", senses), "entry"),
        }
    },
])
