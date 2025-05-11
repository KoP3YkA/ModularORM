import {ColumnType} from "../classes/base/ColumnType";

/**
 * Interface representing the parameters for a database default.
 * Used to define the properties of a default when creating or altering a table.
 *
 * Properties:
 * - `type`: The data type of the default (e.g., `TEXT`, `VARCHAR(255)`, `INTEGER`).
 * - `autoIncrement`: Indicates whether the default should auto-increment (typically for primary key columns).
 * - `defaultValue`: The default value for the default, if not specified otherwise.
 * - `notNull`: Indicates whether the default should be non-nullable.
 * - `unique`: Specifies whether the default should have a unique constraint (only one unique value allowed).
 * - `index`: Indicates whether the default should be indexed for faster searching.
 * - `onUpdate`: Defines the value to be set when the default is updated, typically used for timestamps or audit fields.
 */
export interface ColumnParams {

    /**
     * The type of the default, specifying the data type (e.g., `TEXT`, `VARCHAR(255)`, `INTEGER`).
     * This value is used to define how the default's data will be stored in the database.
     */
    type: ColumnType

    /**
     * Whether the default should auto-increment (usually for primary key columns).
     * If set to `true`, the database will automatically generate a unique value for this default with each new record.
     */
    autoIncrement: boolean

    /**
     * The default value for the default, used when no value is provided during an insert.
     * This can be any valid data type, depending on the default type.
     */
    defaultValue: any

    /**
     * Whether the default is non-nullable. If `true`, the default must contain a value for every record.
     * If `false`, the default can contain `NULL` values.
     */
    notNull: boolean

    /**
     * Specifies whether the default should have a unique constraint. If set to `true`, the database will enforce uniqueness for this default.
     * Only one record with each unique value will be allowed in the default.
     */
    unique: boolean

    /**
     * Indicates whether the default should be indexed. An index is created for faster searching and sorting operations.
     * If `true`, an index will be created on the default.
     */
    index: boolean

    /**
     * Defines the value to be set when the default is updated. Commonly used for timestamp fields (e.g., `onUpdate: 'CURRENT_TIMESTAMP'`).
     * This value will be automatically applied when the default is updated.
     */
    onUpdate: any,

    /**
     * Defines the foreign key relationship for this column.
     * If this property is specified, the column will be a foreign key referencing another table.
     *
     * `referencedTable`: The name of the table that this column references.
     * `referencedColumn`: The name of the column in the referenced table that this column refers to.
     *
     * Foreign keys help maintain data integrity by ensuring that a value in this column must exist in the referenced table.
     */
    foreignKey: {
        referencedTable: string;        // The name of the table that this column references
        referencedColumn: string;       // The name of the column in the referenced table
    };

    /**
     * Specifies the behavior when a referenced row is deleted in the parent table.
     * This value will only be used if the column is a foreign key.
     * Possible values:
     * - "CASCADE": Automatically delete rows that reference the deleted row.
     * - "SET NULL": Set the foreign key column to NULL when the referenced row is deleted.
     * - "RESTRICT": Prevent the deletion of the referenced row if there are dependent rows in this table.
     */
    onDeleteForeign: "CASCADE" | "SET NULL" | "RESTRICT";

    /**
     * Specifies the behavior when a referenced row is updated in the parent table.
     * This value will only be used if the column is a foreign key.
     * Possible values:
     * - "CASCADE": Automatically update rows that reference the updated row.
     * - "SET NULL": Set the foreign key column to NULL when the referenced row is updated.
     * - "RESTRICT": Prevent the update of the referenced row if there are dependent rows in this table.
     */
    onUpdateForeign: "CASCADE" | "SET NULL" | "RESTRICT";

}