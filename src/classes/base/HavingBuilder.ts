import {BaseBuilder} from "../abstract/BaseBuilder";
import {Errors} from "./Errors";
import {ConditionOperator} from "./WhereBuilder";

/**
 * Builder class for constructing the HAVING clause in SQL queries.
 *
 * This class allows adding conditions to the HAVING clause, typically used with aggregate functions
 * in SQL queries, and supports both AND/OR logical conjunctions between conditions.
 */
export class HavingBuilder extends BaseBuilder {

    private conditions: string[] = [];
    private conjunctions: string[] = [];
    private values: any[] = [];

    public constructor() {
        super();
    }

    /**
     * Adds a condition to the HAVING clause.
     *
     * @param column - The name of the default to apply the condition to.
     * @param operator - The comparison operator (e.g., '=', '>', 'LIKE').
     * @param value - The value to compare the default to.
     *
     * @returns The `HavingBuilder` instance for method chaining.
     */
    public condition(column: string, operator: ConditionOperator, value: any): this {
        this.conditions.push(`${column} ${operator} ?`);
        this.conjunctions.push("AND");
        this.values.push(value);
        return this;
    }

    /**
     * Adds a condition with an AND logical operator to the HAVING clause.
     *
     * @param column - The name of the default to apply the condition to.
     * @param operator - The comparison operator (e.g., '=', '>', 'LIKE').
     * @param value - The value to compare the default to.
     *
     * @returns The `HavingBuilder` instance for method chaining.
     */
    public and(column: string, operator: ConditionOperator, value: any): this {
        this.conditions.push(`${column} ${operator} ?`);
        this.conjunctions.push("AND");
        this.values.push(value);
        return this;
    }

    /**
     * Adds a condition with an OR logical operator to the HAVING clause.
     *
     * @param column - The name of the default to apply the condition to.
     * @param operator - The comparison operator (e.g., '=', '>', 'LIKE').
     * @param value - The value to compare the default to.
     *
     * @returns The `HavingBuilder` instance for method chaining.
     */
    public or(column: string, operator: ConditionOperator, value: any): this {
        this.conditions.push(`${column} ${operator} ?`);
        this.conjunctions.push("OR");
        this.values.push(value);
        return this;
    }

    /**
     * Gets the values for the conditions, which will be used as parameters in the SQL query.
     *
     * @returns An array of values corresponding to the conditions.
     */
    public getValues(): any[] {
        return this.values;
    }

    /**
     * Constructs the SQL condition string for the HAVING clause.
     *
     * This method generates the SQL condition string, combining all added conditions
     * with the appropriate logical conjunctions (AND/OR).
     *
     * @returns A string representing the SQL conditions for the HAVING clause.
     */
    public getCondition(): string {
        let conditionStr = '';

        for (let i = 0; i < this.conditions.length; i++) {
            if (i > 0) {
                conditionStr += ` ${this.conjunctions[i]} `;
            }
            conditionStr += this.conditions[i];
        }

        return conditionStr;
    }

    public build(t: any): any {Errors.BUILDER_MISSING_BUILD_METHOD.throw();}

}