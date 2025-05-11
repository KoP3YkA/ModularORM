export interface SelectQueryParams<T extends string = string> {

    limit: number;
    offset: number;
    order: T;

}