import {BaseBuilder} from "../abstract/BaseBuilder";
import {Errors} from "./Errors";

/**
 * Builder class for constructing the `SET` part of an `UPDATE` SQL query.
 * This class helps to dynamically add columns and their corresponding values for an update query.
 * It manages the `SET default = value` syntax for SQL `UPDATE` queries.
 */
export class UpdateBuilder extends BaseBuilder {

    public updates: string[] = [];
    public values: any[] = [];

    public constructor() {
        super();
    }

    /**
     * Adds an update clause to the `SET` part of the `UPDATE` query.
     * This method appends a default-value pair to the update expression.
     * @param column - The name of the default to be updated.
     * @param value - The new value to set for the default.
     * @returns The current `UpdateBuilder` instance for method chaining.
     */
    public add(column: string, value: any) : this {
        this.updates.push(`${column} = ?`);
        let validValue = value;
        if (value instanceof Date) validValue = `${validValue.getFullYear()}-${String(validValue.getMonth() + 1).padStart(2, "0")}-${String(validValue.getDate()).padStart(2, "0")} ` +
            `${String(validValue.getHours()).padStart(2, "0")}:${String(validValue.getMinutes()).padStart(2, "0")}:${String(validValue.getSeconds()).padStart(2, "0")}`;
        this.values.push(validValue);
        return this;
    }

    public build(t: any): any {Errors.BUILDER_MISSING_BUILD_METHOD.throw();}

}