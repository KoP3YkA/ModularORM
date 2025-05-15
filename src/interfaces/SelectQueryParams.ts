export interface SelectQueryParams<T> {

    limit: number;
    offset: number;
    order: Partial<{ [K in keyof T]: 'ASC' | 'DESC' }>;
    useCache: boolean;
    cacheTTL: number;

}