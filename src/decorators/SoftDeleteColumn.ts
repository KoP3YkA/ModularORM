import {Column} from "./Column";
import {ColumnType} from "../classes/base/ColumnType";
import {System} from "../namespaces/System";
import {Decorator} from "../types/Decorator";

export const SoftDeleteColumn = () : Decorator => {
    return function (target: any, propertyName: string) {
        Column({ type: ColumnType.DATETIME, index: true, notNull: false })(target, propertyName)
        System.SOFT_DELETE_COLUMNS.set(target.constructor, propertyName);
    }
}