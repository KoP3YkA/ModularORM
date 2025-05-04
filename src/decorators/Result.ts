import 'reflect-metadata';
import {System} from "../namespaces/System";

/**
 * Result decorator.
 * This decorator is used to map the resultAnnotations of a database query to the corresponding class properties.
 * The value of the specified `columnName` from the query resultAnnotations will be assigned to the decorated property.
 *
 * @param columnName - The name of the database default to be mapped to the class property.
 * @returns A property decorator that associates the class property with the specified default name from the query resultAnnotations.
 */
export function Result(columnName?: string): PropertyDecorator {
    return (target, propertyKey) => {
        const column: string = columnName ?? String(propertyKey);

        // Индивидуальное сопоставление поля
        Reflect.defineMetadata(
            'resultAnnotations-mapping',
            column,
            target.constructor,
            propertyKey
        );

        // Добавление в общий список
        const existingMappings: Array<{ propertyKey: string, columnName: string }> =
            Reflect.getMetadata('resultAnnotations-mapping-list', target) || [];

        existingMappings.push({ propertyKey: String(propertyKey), columnName: column });

        Reflect.defineMetadata(
            'resultAnnotations-mapping-list',
            existingMappings,
            target
        );
    };
}