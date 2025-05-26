import {ArrowFunction} from "../types/ArrowFunction";
import {ArrowProxyObject} from "../types/ArrowProxyObject";
import {System} from "../namespaces/System";
import {Decorator} from "../types/Decorator";

export const ManyToOne = (
    module: ArrowFunction,
    column: ArrowProxyObject,
) : Decorator => {
    return function (target: any, propertyKey: string) {
        System.MANY_TO_ONE.add({ target: target.constructor, propertyKey, column, table: module, loadType: 'mixed' })
    }
}