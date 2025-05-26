import {ArrowFunction} from "../types/ArrowFunction";
import {ArrowProxyObject} from "../types/ArrowProxyObject";
import {LoadingType} from "../types/LoadingType";
import {System} from "../namespaces/System";
import {Decorator} from "../types/Decorator";

export const ManyToMany = (
    module: ArrowFunction,
    column: ArrowProxyObject,
    params?: {
        loadType?: LoadingType,
        result?: ArrowFunction
    }
) : Decorator => {
    return function (target: any, propertyKey: string) {
        System.MANY_TO_MANY.add({ target: target.constructor, propertyKey, table: module, column, result: params?.result, loadType: params?.loadType ?? 'mixed' })
    }
}