import {BaseEnumClass} from "../abstract/BaseEnumClass";

/**
 * Class representing default types for database fields.
 * Used to define the data types for columns in database tables.
 * The class follows the Enum pattern, providing a set of predefined default types.
 *
 * Examples of predefined default types:
 * - `TEXT`: For storing long text values.
 * - `VARCHAR(N)`: For variable-length strings with a specified maximum length (e.g., `VARCHAR(255)`).
 * - `INTEGER`: For storing integer values.
 * - `DATETIME`: For storing date and time values.
 * - `TIMESTAMP`: For storing timestamp values (typically for recording the time of an event).
 * - `DATE`: For storing date values.
 */
export class ColumnType extends BaseEnumClass {
    /**
     * Represents the `TEXT` default type.
     */
    public static TEXT : ColumnType = new ColumnType('TEXT');

    /**
     * Represents the `VARCHAR(N)` default type, where N is the maximum number of characters.
     * This is used for variable-length strings with a specific length limit.
     *
     * @param symbols - The maximum number of characters that can be stored in the default.
     * @returns A `ColumnType` instance representing `VARCHAR(N)`.
     */
    public static VARCHAR = (symbols: number) => new ColumnType(`VARCHAR(${symbols})`)

    /**
     * Represents the `INTEGER` default type.
     * Used for storing whole number values.
     */
    public static INTEGER : ColumnType = new ColumnType('INTEGER');

    /**
     * Represents the `DATETIME` default type.
     * Used for storing both date and time values in the format `YYYY-MM-DD HH:MM:SS`.
     */
    public static DATETIME : ColumnType = new ColumnType('DATETIME');

    /**
     * Represents the `TIMESTAMP` default type.
     * Used for storing timestamps, typically representing the time a record was created or updated.
     */
    public static TIMESTAMP : ColumnType = new ColumnType('TIMESTAMP');

    /**
     * Represents the `DATE` default type.
     * Used for storing only the date in the format `YYYY-MM-DD`.
     */
    public static DATE : ColumnType = new ColumnType('DATE');

    /**
     * Represents the `BOOLEAN` default type.
     * Used for storing whole true of false values.
     */
    public static BOOLEAN : ColumnType = new ColumnType('BOOLEAN');

    /**
     * Represents the `JSON` default type.
     * Used for json-objects
     */
    public static JSON : ColumnType = new ColumnType('JSON');

    // -------------------------------------------------------

    protected constructor(
        public type : string,
    ) {super();}

    public static getByName(name: string) : ColumnType | null {
        if (name.startsWith('varchar(')) {
            const match = name.match(/^varchar\((\d+)\)$/);
            if (match) {
                const num = parseInt(match[1], 10);
                return this.VARCHAR(num);
            }
        }

        switch (name) {
            case 'json': return this.JSON;
            case 'text': return this.TEXT;
            case 'int': return this.INTEGER;
            case 'datetime': return this.DATETIME;
            case 'timestamp': return this.TIMESTAMP;
            case 'date': return this.DATE;
            case 'tinyint(1)': return this.BOOLEAN;
            default: return null;
        }

    }

}