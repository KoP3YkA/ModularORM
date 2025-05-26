import {Decorator} from "../types/Decorator";
import {System} from "../namespaces/System";

export const RenamedColumn = (oldName: string) : Decorator => {
    return function (target: any, propertyKey: string) : void {
        System.RENAMED_COLUMN.add({ target, propertyKey, oldName })
    }
}