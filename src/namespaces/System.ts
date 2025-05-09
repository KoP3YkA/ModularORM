import {MigrationType} from "../enums/MigrationType";
import {DatabaseParams} from "../interfaces/DatabaseParams";

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
    export const MIGRATION_TABLES : Map<Function, Set<MigrationType>> = new Map()
    export let DATABASE_CONNECTION_DATA : DatabaseParams;

}