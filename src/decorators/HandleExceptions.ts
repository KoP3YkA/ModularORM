import {Logger} from "../classes/Logger";
import {Settings} from "../classes/base/Settings";

export const HandleExceptions = (returnsWhenError?: any) : MethodDecorator => {
    return function (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const result = originalMethod.apply(this, args);

            if (result && typeof result.then === "function") {
                let isHandled = false;

                const wrapped = result
                    .then(
                        (val: any) => {
                            isHandled = true;
                            return val;
                        },
                        (err: any) => {
                            if (!isHandled) {
                                Logger.error(err)
                                if (returnsWhenError && Settings.returnsNullWhenError) {
                                    return returnsWhenError;
                                }
                            }
                            throw err
                        }
                    );

                const originalCatch = wrapped.catch.bind(wrapped);
                wrapped.catch = (...catchArgs: any[]) => {
                    isHandled = true;
                    return originalCatch(...catchArgs);
                };

                return wrapped;
            }

            return result;
        };

        return descriptor;
    };
}