/** @format */
import { KorpQueryRequestOptions } from "./kwic-proxy"
import { ExampleTask } from "./example-task"

export class WordpicExampleTask extends ExampleTask {
    constructor(source: string) {
        super({ source })
    }

    getParams(page: number, hpp: number): KorpQueryRequestOptions {
        return {
            ...super.getParams(page, hpp),
            command: "relations_sentences",
        }
    }
}
