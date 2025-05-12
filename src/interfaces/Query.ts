export interface Query {
    sql: string,
    params: any[],
    useCache?: boolean,
    cacheTTL?: number
}