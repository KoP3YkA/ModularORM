import {BaseEnumClass} from "../abstract/BaseEnumClass";

/**
 * Enum-like class for representing commonly used SQL functions.
 * This class provides predefined constants for common SQL functions like `CURRENT_TIMESTAMP`, `NOW()`, and others.
 * You can also create custom SQL functions like `CONCAT()` with variable arguments.
 */
export class SqlFunctions extends BaseEnumClass {

    /**
     * Represents the `CURRENT_TIMESTAMP` SQL function.
     */
    public static CURRENT_TIMESTAMP: SqlFunctions = new SqlFunctions('CURRENT_TIMESTAMP');

    /**
     * Represents the `NOW()` SQL function, which returns the current date and time.
     */
    public static NOW: SqlFunctions = new SqlFunctions('NOW()');

    /**
     * Represents the `UUID()` SQL function, which generates a unique identifier.
     */
    public static UUID: SqlFunctions = new SqlFunctions('UUID()');

    /**
     * Represents the `RAND()` SQL function, which generates a random floating-point number.
     */
    public static RAND: SqlFunctions = new SqlFunctions('RAND()');

    /**
     * Represents the `CURRENT_USER()` SQL function, which returns the current MySQL user.
     */
    public static CURRENT_USER: SqlFunctions = new SqlFunctions('CURRENT_USER()');

    /**
     * Represents the `UNIX_TIMESTAMP()` SQL function, which returns the current Unix timestamp.
     */
    public static UNIX_TIMESTAMP: SqlFunctions = new SqlFunctions('UNIX_TIMESTAMP()');

    /**
     * Represents the `DATE()` SQL function, which extracts the date part from a datetime or timestamp value.
     */
    public static DATE: SqlFunctions = new SqlFunctions('DATE()');

    /**
     * Represents the `TIME()` SQL function, which extracts the time part from a datetime or timestamp value.
     */
    public static TIME: SqlFunctions = new SqlFunctions('TIME()');

    /**
     * Represents the `CONCAT()` SQL function, which concatenates multiple strings.
     *
     * @param args - The list of strings to concatenate.
     * @returns A new `SqlFunctions` instance representing the `CONCAT()` function with the given arguments.
     */
    public static CONCAT(args: string[]): SqlFunctions {
        return new SqlFunctions(`CONCAT(${args.join(', ')})`);
    }

    //----------------------------------------------------------

    protected constructor(
        public name : string,
    ) {super();}

}