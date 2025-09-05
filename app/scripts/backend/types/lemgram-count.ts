/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1lemgram_count/get */

export type LemgramCountParams = {
    lemgram: string
    count: "lemgram"
    corpus: string
}

export type LemgramCountResponse = {
    // The key type is given as more specific than `string` only to make TS distinguish it from "ERROR".
    [lemgram: string]: number
}
