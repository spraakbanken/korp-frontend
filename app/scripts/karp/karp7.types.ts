/** @format */

export type Karp7QueryResponse<T> = {
    total: number
    hits: T[]
    distribution: Record<string, number>
}

export type Karp7SaldoEntry = {
    senseID: string
    primary: string
    // There's more, but not used here
}

export type Karp7SwefnEntry = {
    swefnID: string
    LUs: string[]
    // There's more, but not used here
}
