/** @format */
import { RelationsSentencesProxy } from "../backend/proxy/relations-sentences-proxy"
import { RelationsSentencesResponse } from "../backend/types/relations-sentences"
import { TaskBase } from "./task-base"

export class WordpicExampleTask extends TaskBase<RelationsSentencesResponse> {
    readonly isReadingInit = false // Context param is not supported by /relations_sentences
    readonly proxy = new RelationsSentencesProxy()

    constructor(readonly source: string) {
        super()
    }

    abort(): void {
        this.proxy.abort()
    }

    send(page: number, hpp: number): Promise<RelationsSentencesResponse> {
        return this.proxy.makeRequest(this.source, page, hpp)
    }
}
