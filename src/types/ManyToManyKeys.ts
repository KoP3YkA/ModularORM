import * as Module from "node:module";

export type ManyToManyKeys<T> = {
    [K in keyof T]: T[K] extends Object[] ? K : never;
}[keyof T];