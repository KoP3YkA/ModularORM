import {Errors} from "../base/Errors";

/**
 * Abstract class for database table models.
 *
 * This class serves as a base for all table classes in the ORM system.
 * Each subclass should define its own table name by overriding the static `table` getter.
 * The `Module` class itself does not represent a specific table and should not be instantiated directly.
 */
export abstract class Module {

    /**
     * Abstract getter for the table name.
     *
     * This method must be overridden in the subclass to return the name of the corresponding database table.
     * If not overridden, an error will be thrown indicating that the method was not implemented.
     *
     * @returns {string} The name of the database table.
     * @throws {Error} Throws an error if not implemented in the subclass.
     */
    public static get table() : string {
        Errors.METHOD_NOT_IMPLEMENTED.throw();
        return "Error";
    }

}