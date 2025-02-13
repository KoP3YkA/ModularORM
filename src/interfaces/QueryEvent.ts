import {QueryType} from "../classes/base/QueryType";

export interface QueryEvent {
    type: QueryType,
    table: string
}