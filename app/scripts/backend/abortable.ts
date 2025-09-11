export default abstract class Abortable {
    private abortController = new AbortController()

    /** Abort any running request */
    abort(): void {
        this.abortController?.abort()
        this.abortController = new AbortController()
    }

    getAbortSignal(): AbortSignal {
        return this.abortController.signal
    }
}
