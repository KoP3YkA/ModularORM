import {System} from "../../../namespaces/System";

export class ValidatorFactory {

    public static createValidator(func: (value: any, column: string) => boolean, message: string) : Function {
        return function (target: Object, propertyKey: string) {
            const construct = target.constructor;
            if (!System.VALIDATORS.has(construct)) System.VALIDATORS.set(construct, new Set())
            const list : Set<Map<string, {func: (value: any, column: string) => boolean, message: string}>> = System.VALIDATORS.get(construct) as unknown as Set<Map<string, {func: (value: any, column: string) => boolean, message: string}>>;
            list.add(new Map().set(propertyKey, {func, message}))
        }
    }

}