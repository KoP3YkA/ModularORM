import {BaseEnumClass} from "../abstract/BaseEnumClass";

/**
 * Class representing column types for database fields.
 * Used to define the data types for columns in database tables.
 * The class follows the Enum pattern, providing a set of predefined column types.
 *
 * Examples of predefined column types:
 * - `TEXT`: For storing long text values.
 * - `VARCHAR(N)`: For variable-length strings with a specified maximum length (e.g., `VARCHAR(255)`).
 * - `INTEGER`: For storing integer values.
 * - `DATETIME`: For storing date and time values.
 * - `TIMESTAMP`: For storing timestamp values (typically for recording the time of an event).
 * - `DATE`: For storing date values.
 */
export class ColumnType extends BaseEnumClass {
    /**
     * Represents the `TEXT` column type.
     */
    public static TEXT : ColumnType = new ColumnType('TEXT');

    /**
     * Represents the `VARCHAR(N)` column type, where N is the maximum number of characters.
     * This is used for variable-length strings with a specific length limit.
     *
     * @param symbols - The maximum number of characters that can be stored in the column.
     * @returns A `ColumnType` instance representing `VARCHAR(N)`.
     */
    public static VARCHAR = (symbols: number) => new ColumnType(`VARCHAR(${symbols})`)

    /**
     * Represents the `INTEGER` column type.
     * Used for storing whole number values.
     */
    public static INTEGER : ColumnType = new ColumnType('INTEGER');

    /**
     * Represents the `DATETIME` column type.
     * Used for storing both date and time values in the format `YYYY-MM-DD HH:MM:SS`.
     */
    public static DATETIME : ColumnType = new ColumnType('DATETIME');

    /**
     * Represents the `TIMESTAMP` column type.
     * Used for storing timestamps, typically representing the time a record was created or updated.
     */
    public static TIMESTAMP : ColumnType = new ColumnType('TIMESTAMP');

    /**
     * Represents the `DATE` column type.
     * Used for storing only the date in the format `YYYY-MM-DD`.
     */
    public static DATE : ColumnType = new ColumnType('DATE');

    /**
     * Represents the `BOOLEAN` column type.
     * Used for storing whole true of false values.
     */
    public static BOOLEAN : ColumnType = new ColumnType('BOOLEAN');

    /**
     * Represents the `JSON` column type.
     * Used for json-objects
     */
    public static JSON : ColumnType = new ColumnType('JSON');

    // -------------------------------------------------------

    public constructor(
        public type : string,
    ) {super();}

}