import {ColumnType} from "../classes/base/ColumnType";
import {ColumnParams} from "../interfaces/ColumnParams";
import 'reflect-metadata'

/**
 * Column decorator.
 * This decorator is used to define metadata for class properties that map to database columns.
 * It allows specifying column-specific parameters such as type, auto-increment, not-null, default value, uniqueness, indexing, and update behavior.
 *
 * The decorator stores this metadata for later use when generating SQL queries or interacting with the database.
 *
 * @param params - The column parameters, which include:
 * - `type`: The data type of the column (default: `ColumnType.VARCHAR`).
 * - `autoIncrement`: Whether the column value should auto-increment (default: `false`).
 * - `notNull`: Whether the column should be non-nullable (default: `false`).
 * - `defaultValue`: The default value for the column (default: `null`).
 * - `unique`: Whether the column should have a unique constraint (default: `false`).
 * - `index`: Whether the column should be indexed for faster querying (default: `false`).
 * - `onUpdate`: Defines the value to be set when the column is updated (default: `null`).
 *
 * @returns A property decorator that defines column metadata for the class property.
 */
export function Column(params: Partial<ColumnParams>) {
    return function (target: any, propertyKey: string) {
        const existingColumns = Reflect.getMetadata("columns", target) || [];

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
                onUpdate: params.onUpdate !== undefined ? params.onUpdate : null
            }
        });

        Reflect.defineMetadata("columns", existingColumns, target);
    };
}