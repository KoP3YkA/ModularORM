import {BaseBuilder} from "../abstract/BaseBuilder";
import {Errors} from "./Errors";
import {ConditionOperator} from "./WhereBuilder";

export class HavingBuilder extends BaseBuilder {

    private conditions: string[] = [];
    private conjunctions: string[] = [];
    private values: any[] = [];

    public constructor() {
        super();
    }

    /**
     * Adds a condition to the HAVING clause.
     * @param column - The name of the column to apply the condition to.
     * @param operator - The comparison operator (e.g. '=', '>', 'LIKE').
     * @param value - The value to compare the column to.
     */
    public condition(column: string, operator: ConditionOperator, value: any): this {
        this.conditions.push(`${column} ${operator} ?`);
        this.conjunctions.push("AND");
        this.values.push(value);
        return this;
    }

    /**
     * Adds a condition with an AND logical operator.
     * @param column - The name of the column to apply the condition to.
     * @param operator - The comparison operator (e.g. '=', '>', 'LIKE').
     * @param value - The value to compare the column to.
     */
    public and(column: string, operator: ConditionOperator, value: any): this {
        this.conditions.push(`${column} ${operator} ?`);
        this.conjunctions.push("AND");
        this.values.push(value);
        return this;
    }

    /**
     * Adds a condition with an OR logical operator.
     * @param column - The name of the column to apply the condition to.
     * @param operator - The comparison operator (e.g. '=', '>', 'LIKE').
     * @param value - The value to compare the column to.
     */
    public or(column: string, operator: ConditionOperator, value: any): this {
        this.conditions.push(`${column} ${operator} ?`);
        this.conjunctions.push("OR");
        this.values.push(value);
        return this;
    }

    public getValues(): any[] {
        return this.values;
    }

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

    public build(t: any): any {Errors.BUILDER_DONT_HAVE_BUILD_METHOD.throw();}

}