/** @format */
import { KorpQueryRequestOptions } from "./kwic-proxy"
import { ExampleTask } from "./example-task"

export class WordpicExampleTask extends ExampleTask {
    constructor(source: string) {
        super({ source })
    }

    getParams(page: number, hpp: number, inOrder?: boolean, within?: string): KorpQueryRequestOptions {
        return {
            ...super.getParams(page, hpp, inOrder, within),
            command: "relations_sentences",
        }
    }
}
