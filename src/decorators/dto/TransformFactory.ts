import {System} from "../../namespaces/System";

export class TransformFactory {

    public static createTransform(func: (value: any) => any) {
        return function (target: Object, propertyKey: string) {
            if (!System.TRANSFORMS.has(target.constructor)) System.TRANSFORMS.set(target.constructor, new Map())
            const list = System.TRANSFORMS.get(target.constructor) as unknown as Map<string, (value: any) => any>
            list.set(propertyKey, func)
        }
    }

}