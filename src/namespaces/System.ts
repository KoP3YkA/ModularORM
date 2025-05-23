
import {DatabaseParams} from "../interfaces/DatabaseParams";
import {TableCreateParams} from "../interfaces/TableCreateParams";

interface Executor {
    prototype: any,
    method: string
}

export namespace System {

    export const TABLES : Map<string, any> = new Map();
    export const TABLES_NAMES : Map<any, string> = new Map();
    export const EVENT_HANDLERS : Map<any, string> = new Map();
    export const VALIDATORS : Map<
        Object, Set<
            Map<string, {
                func: (value: any, column: string) => boolean,
                message: string
            }>
        >
    > = new Map();
    export const TRANSFORMS : Map<Object, Map<string, (value: any) => any>> = new Map();
    export const MIGRATION_TABLES : Set<Function> = new Set()
    export let DATABASE_CONNECTION_DATA : DatabaseParams;
    export const TABLES_PRIORITY : Map<string, number> = new Map()
    export const TABLES_SETTINGS : Map<string, TableCreateParams> = new Map();



}