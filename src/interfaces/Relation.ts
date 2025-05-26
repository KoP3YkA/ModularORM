import {ArrowFunction} from "../types/ArrowFunction";
import {ArrowProxyObject} from "../types/ArrowProxyObject";
import {LoadingType} from "../types/LoadingType";

export interface Relation {
    target: Function;
    propertyKey: string;
    table: ArrowFunction;
    column: ArrowProxyObject;
    result?: ArrowFunction;
    loadType: LoadingType
}