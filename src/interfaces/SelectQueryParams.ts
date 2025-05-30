import {Module} from "../classes/abstract/Module";
import {ClassConstructor} from "../types/ClassConstructor";

export interface SelectQueryParams<T> {

    limit: number;
    offset: number;
    order: Partial<{ [K in keyof T]: 'ASC' | 'DESC' }>;
    useCache: boolean;
    cacheTTL: number;
    relations: (string | ClassConstructor<Module>)[];
    depth: number;

}