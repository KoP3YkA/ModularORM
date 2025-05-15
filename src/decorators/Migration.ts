import {System} from "../namespaces/System";

export function Migration() {
    return function (target: Function) {
        System.MIGRATION_TABLES.add(target)
    }
}