
import {DatabaseParams} from "../interfaces/DatabaseParams";
import {TableCreateParams} from "../interfaces/TableCreateParams";
import {Relation} from "../interfaces/Relation";
import {IJoinTable} from "../interfaces/JoinTableInterface";

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
    export const SOFT_DELETE_COLUMNS : Map<any, string> = new Map();
    export const BUILD_SCHEMA : Map<Function, Partial<TableCreateParams>> = new Map();
    export const JOIN_TABLES : Set<IJoinTable> = new Set();
    export const RENAMED_COLUMN : Set<{ target: any, propertyKey: string, oldName: string }> = new Set();

    export const MANY_TO_ONE : Set<Relation> = new Set();
    export const ONE_TO_MANY : Set<Relation> = new Set();
    export const MANY_TO_MANY : Set<Relation> = new Set();

    export const MAPPING_CACHE = new Map<any, Array<{ propertyKey: string; columnName: string }>>();

}