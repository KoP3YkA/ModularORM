import {System} from "../namespaces/System";

export function NamedTable(tableName: string): ClassDecorator {
    return (target: Function) => {
        System.TABLES.set(tableName, target)
        Object.defineProperty(target, 'table', {
            get() {
                return tableName;
            },
            enumerable: true,
            configurable: true
        });
    };
}