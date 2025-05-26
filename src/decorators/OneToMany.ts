import {ArrowFunction} from "../types/ArrowFunction";
import {ArrowProxyObject} from "../types/ArrowProxyObject";
import {System} from "../namespaces/System";
import {LoadingType} from "../types/LoadingType";
import {Decorator} from "../types/Decorator";

export const OneToMany = (
    module: ArrowFunction,
    column: ArrowProxyObject,
    params?: {
        result?: ArrowFunction,
        loadType?: LoadingType
    }
) : Decorator => {
    return function (target: any, propertyKey: string) {
        System.ONE_TO_MANY.add({ target: target.constructor, propertyKey, column, table: module, result: params?.result, loadType: params?.loadType ?? 'mixed' })
    }
}