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
    public static BIGINT : ColumnType = new ColumnType('BIGINT');
    public static FLOAT : ColumnType = new ColumnType('FLOAT');
    public static DOUBLE : ColumnType = new ColumnType('DOUBLE');
    public static DECIMAL = (precision: number, scale: number) =>
        new ColumnType(`DECIMAL(${precision},${scale})`);
    public static BLOB : ColumnType = new ColumnType('BLOB');
    public static TIME : ColumnType = new ColumnType('TIME');
    public static YEAR : ColumnType = new ColumnType('YEAR');

    // -------------------------------------------------------

    protected constructor(
        public type : string,
    ) {super();}

    public static getByName(name: string): ColumnType | null {
        const lower = name.toLowerCase();

        if (lower.startsWith('varchar(')) {
            const match = lower.match(/^varchar\((\d+)\)$/);
            if (match) {
                return this.VARCHAR(parseInt(match[1], 10));
            }
        }

        if (lower.startsWith('decimal(')) {
            const match = lower.match(/^decimal\((\d+),(\d+)\)$/);
            if (match) {
                return this.DECIMAL(parseInt(match[1], 10), parseInt(match[2], 10));
            }
        }

        switch (lower) {
            case 'text': return this.TEXT;
            case 'int':
            case 'integer': return this.INTEGER;
            case 'bigint': return this.BIGINT;
            case 'float': return this.FLOAT;
            case 'double': return this.DOUBLE;
            case 'datetime': return this.DATETIME;
            case 'timestamp': return this.TIMESTAMP;
            case 'date': return this.DATE;
            case 'time': return this.TIME;
            case 'year': return this.YEAR;
            case 'json': return this.JSON;
            case 'blob': return this.BLOB;
            case 'tinyint(1)': return this.BOOLEAN;
            case 'boolean': return this.BOOLEAN;
            default: return null;
        }
    }

}