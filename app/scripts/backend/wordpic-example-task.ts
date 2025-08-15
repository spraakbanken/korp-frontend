/** @format */
import { RelationsSentencesProxy } from "./relations-sentences-proxy"
import { RelationsSentencesResponse } from "./types/relations-sentences"

export class WordpicExampleTask {
    isReading = false // Context param is not supported by /relations_sentences
    readonly proxy = new RelationsSentencesProxy()
    constructor(readonly source: string) {}

    abort(): void {
        this.proxy.abort()
    }

    send(page: number, hpp: number): Promise<RelationsSentencesResponse> {
        return this.proxy.makeRequest(this.source, page, hpp)
    }
}
