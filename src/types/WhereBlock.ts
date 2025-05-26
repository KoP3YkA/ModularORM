import {Module} from "../classes/abstract/Module";

export type WhereBlock<T extends Module> = {
    [K in keyof T]?: T[K] | T[K][];
};