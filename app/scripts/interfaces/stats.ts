
export interface StatsData {
    combined: InnerData[]
    count: number
    corpora: Corpora
    time: number
}
export interface InnerData {
    rows?: RowsEntity[] | null
    sums: Sums
    cqp?: string
}
export interface RowsEntity {
    value: Value
    relative: number
    absolute: number
}
export interface Value {
    word?: string[] | null
}
export interface Sums {
    relative: number
    absolute: number
}
export interface Corpora {
    [key: string]: InnerData
}
