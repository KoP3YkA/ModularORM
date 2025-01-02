import 'reflect-metadata';

export function Result(columnName: string): PropertyDecorator {
    return (target, propertyKey) => {
        Reflect.defineMetadata('result-mapping', columnName, target, propertyKey);
    };
}