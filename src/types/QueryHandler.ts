import {Query} from "../interfaces/Query";
import {QueryType} from "../classes/base/QueryType";
import {QueryEvent} from "../interfaces/QueryEvent";

export type QueryHandler = Query & QueryType & QueryEvent