import {BaseBuilder} from "../abstract/BaseBuilder";
import {Errors} from "./Errors";

/**
 * Builder for constructing an INSERT SQL query.
 * This builder allows adding default-value pairs and provides a way to generate the appropriate SQL syntax for the query.
 * It supports both simple and separated default-value styles.
 */
export class InsertBuilder extends BaseBuilder {

    /**
     * Indicates whether to use a separated format for columns and values.
     * When true, the query will specify default names explicitly (e.g., (column1, column2) VALUES (value1, value2)).
     * When false, the query will only include VALUES (value1, value2).
     */
    public separated : boolean;

    public values : Map<string, any> = new Map()

    /**
     * Constructs an InsertBuilder instance.
     * @param separated - Determines whether the query should separate columns and values.
     */
    public constructor(separated: boolean) {
        super();
        this.separated = separated;
    }

    /**
     * Adds a default-value pair to the INSERT query.
     * @param column - The name of the default to insert the value into.
     * @param value - The value to be inserted into the specified default.
     * @returns The current InsertBuilder instance for method chaining.
     */
    public add(column: string, value: any): this {
        let validValue : any = value;
        if (typeof value === 'object' && value !== null) validValue = JSON.stringify(value)
        if (value instanceof Date) validValue = `${validValue.getFullYear()}-${String(validValue.getMonth() + 1).padStart(2, "0")}-${String(validValue.getDate()).padStart(2, "0")} ` +
            `${String(validValue.getHours()).padStart(2, "0")}:${String(validValue.getMinutes()).padStart(2, "0")}:${String(validValue.getSeconds()).padStart(2, "0")}`;
        this.values.set(column, validValue);
        return this;
    }

    private get getShieldedValues(): string {
        if (this.separated) {
            return Array.from(this.values.values())
                .map(() => '?')
                .join(',');
        }
        else {
            return Array.from(this.values.entries())
                .map(([column, value]) => `${column}=${this.getShieldedValue(value)}`)
                .join(', ');
        }
    }

    private getShieldedValue(value: any): string {
        return '?';
    }

    /**
     * Returns the constructed query string for the INSERT statement.
     * @returns The SQL query string for the INSERT operation.
     */
    public get toQuery(): string {
        if (this.separated) {
            return `(${
                Array.from(this.values.keys()).join(', ')
            }) VALUES (${this.getShieldedValues})`;
        } else {
            return `VALUES (${this.getShieldedValues})`;
        }
    }

    /**
     * Returns the values for the INSERT query as an array of values.
     * @returns An array of values to be inserted into the database.
     */
    public get getValues() : any[] {return Array.from(this.values.values())}

    public build(t: any): any {Errors.BUILDER_MISSING_BUILD_METHOD.throw()}

}