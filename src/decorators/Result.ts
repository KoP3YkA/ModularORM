import 'reflect-metadata';

/**
 * Result decorator.
 * This decorator is used to map the result of a database query to the corresponding class properties.
 * The value of the specified `columnName` from the query result will be assigned to the decorated property.
 *
 * @param columnName - The name of the database column to be mapped to the class property.
 * @returns A property decorator that associates the class property with the specified column name from the query result.
 */
export function Result(columnName: string): PropertyDecorator {
    return (target, propertyKey) => {
        Reflect.defineMetadata('result-mapping', columnName, target, propertyKey);
    };
}