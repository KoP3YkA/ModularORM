import {ColumnType} from "../classes/base/ColumnType";
import {ColumnParams} from "../interfaces/ColumnParams";
import 'reflect-metadata'
import {Decorator} from "../types/Decorator";

/**
 * Column decorator.
 * This decorator is used to define metadata for class properties that map to database columns.
 * It allows specifying default-specific parameters such as type, auto-increment, not-null, default value, uniqueness, indexing, and update behavior.
 *
 * The decorator stores this metadata for later use when generating SQL queries or interacting with the database.
 *
 * @param params - The default parameters, which include:
 * - `type`: The data type of the default (default: `ColumnType.VARCHAR`).
 * - `autoIncrement`: Whether the default value should auto-increment (default: `false`).
 * - `notNull`: Whether the default should be non-nullable (default: `false`).
 * - `defaultValue`: The default value for the default (default: `null`).
 * - `unique`: Whether the default should have a unique constraint (default: `false`).
 * - `index`: Whether the default should be indexed for faster querying (default: `false`).
 * - `onUpdate`: Defines the value to be set when the default is updated (default: `null`).
 *
 * @returns A property decorator that defines default metadata for the class property.
 */
export function Column(params: Partial<ColumnParams>) : Decorator {
    return function (target: any, propertyKey: string) : void {
        const existingColumns = Reflect.getMetadata("columns", target.constructor) || [];

        existingColumns.push({
            propertyKey,
            params: {
                ...params,
                type: params.type || ColumnType.VARCHAR,
                autoIncrement: params.autoIncrement || false,
                notNull: params.notNull || false,
                defaultValue: params.defaultValue !== undefined ? params.defaultValue : null,
                unique: params.unique || false,
                index: params.index || false,
                onUpdate: params.onUpdate !== undefined ? params.onUpdate : null,
                foreignKey: params.foreignKey || false,
                onDeleteForeign: params.onDeleteForeign || false,
                onUpdateForeign: params.onUpdateForeign || false,
                comment: params.comment || false
            }
        });

        Reflect.defineMetadata("columns", existingColumns, target.constructor);

        const columnMappings =
            Reflect.getMetadata("resultAnnotations-mapping-list", target) || [];

        columnMappings.push({ propertyKey, columnName: propertyKey });
        Reflect.defineMetadata(
            "resultAnnotations-mapping-list",
            columnMappings,
            target
        );
        Reflect.defineMetadata(
            "resultAnnotations-mapping",
            propertyKey,
            target,
            propertyKey
        );
    };
}