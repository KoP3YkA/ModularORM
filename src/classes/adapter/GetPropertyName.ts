import {ModularORMException} from "../base/ModularORMException";

export class PropertyName {

    public static getPropertyName(fn: (obj: any) => any) : string {
        let accessedProp: string | null = null;

        const proxy = new Proxy({}, {
            get(target, prop) {
                accessedProp = prop.toString();
                return undefined;
            }
        });

        fn(proxy);

        if (!accessedProp) throw new ModularORMException('Cannot get property name')

        return accessedProp;
    }

}