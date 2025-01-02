import {ColumnType} from "../classes/base/ColumnType";

/**
 * Interface representing the parameters for a database column.
 * Used to define the properties of a column when creating or altering a table.
 *
 * Properties:
 * - `type`: The data type of the column (e.g., `TEXT`, `VARCHAR(255)`, `INTEGER`).
 * - `autoIncrement`: Indicates whether the column should auto-increment (typically for primary key columns).
 * - `defaultValue`: The default value for the column, if not specified otherwise.
 * - `notNull`: Indicates whether the column should be non-nullable.
 * - `unique`: Specifies whether the column should have a unique constraint (only one unique value allowed).
 * - `index`: Indicates whether the column should be indexed for faster searching.
 * - `onUpdate`: Defines the value to be set when the column is updated, typically used for timestamps or audit fields.
 */
export interface ColumnParams {

    /**
     * The type of the column, specifying the data type (e.g., `TEXT`, `VARCHAR(255)`, `INTEGER`).
     * This value is used to define how the column's data will be stored in the database.
     */
    type: ColumnType

    /**
     * Whether the column should auto-increment (usually for primary key columns).
     * If set to `true`, the database will automatically generate a unique value for this column with each new record.
     */
    autoIncrement: boolean

    /**
     * The default value for the column, used when no value is provided during an insert.
     * This can be any valid data type, depending on the column type.
     */
    defaultValue: any

    /**
     * Whether the column is non-nullable. If `true`, the column must contain a value for every record.
     * If `false`, the column can contain `NULL` values.
     */
    notNull: boolean

    /**
     * Specifies whether the column should have a unique constraint. If set to `true`, the database will enforce uniqueness for this column.
     * Only one record with each unique value will be allowed in the column.
     */
    unique: boolean

    /**
     * Indicates whether the column should be indexed. An index is created for faster searching and sorting operations.
     * If `true`, an index will be created on the column.
     */
    index: boolean

    /**
     * Defines the value to be set when the column is updated. Commonly used for timestamp fields (e.g., `onUpdate: 'CURRENT_TIMESTAMP'`).
     * This value will be automatically applied when the column is updated.
     */
    onUpdate: any

}