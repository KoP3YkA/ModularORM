import {Decorator} from "../types/Decorator";
import {System} from "../namespaces/System";

export const JoinTable = (
    name?: string,
    onDelete?: "CASCADE" | "SET NULL" | "RESTRICT"
) : Decorator => {
    return function (target: any, propertyKey: string) {
        System.JOIN_TABLES.add({
            target: target.constructor,
            propertyKey,
            name,
            onDelete
        })
    }
}