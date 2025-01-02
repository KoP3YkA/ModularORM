import {BaseBuilder} from "../abstract/BaseBuilder";
import {Errors} from "./Errors";

export type ConditionOperator = '=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'BETWEEN';

export class WhereBuilder extends BaseBuilder {

    private conditions: string[] = [];
    private nextConjunctions: string[] = [];
    private values: any[] = [];

    public constructor() {
        super();
    }

    /**
     * WHERE column = value AND...
     * @param column - name of column
     * @param value - equals value
     */
    public equalAnd(column: string, value: any): this {
        this.conditions.push(`${column} = ?`);
        this.values.push(value);
        this.nextConjunctions.push('AND')
        return this;
    }

    /**
     * WHERE column = value OR...
     * @param column - name of column
     * @param value - equals value
     */
    public equalOr(column: string, value: any): this {
        this.conditions.push(`${column} = ?`);
        this.values.push(value);
        this.nextConjunctions.push('OR')
        return this;
    }

    /**
     * WHERE column operator value AND...
     * @param column - name of column
     * @param operator - equal operator (>, <, = and more...)
     * @param value - equals value
     */
    public conditionAnd(column: string, operator: ConditionOperator, value: any): this {
        this.conditions.push(`${column} ${operator} ?`);
        this.values.push(value);
        this.nextConjunctions.push('AND')
        return this;
    }

    /**
     * WHERE column operator value OR...
     * @param column - name of column
     * @param operator - equal operator (>, <, = and more...)
     * @param value - equals value
     */
    public conditionOr(column: string, operator: ConditionOperator, value: any): this {
        this.conditions.push(`${column} ${operator} ?`);
        this.values.push(value);
        this.nextConjunctions.push('OR')
        return this;
    }

    /**
     * Adds a subquery (where builder.toString() will be enclosed in parentheses)
     * @param builder - WhereBuilder
     * @param nextCondition - next condition. AND / OR
     */
    public addSubQuery(builder: WhereBuilder, nextCondition : "AND" | "OR" = "AND"): this {
        this.conditions.push(`(${builder.toString()})`);
        this.nextConjunctions.push(nextCondition);
        this.values = [...this.values, ...builder.getValues()];
        return this;
    }

    public toString(): string {
        let sql = "";
        for (let i = 0; i < this.conditions.length; i++) {
            sql += ` ${this.conditions[i]}`;
            if (i+1 < this.conditions.length) sql += ` ${this.nextConjunctions[i]}`
        }
        return sql.trim();
    }

    public getValues(): any[] {
        return this.values;
    }

    public build(t: any): any {Errors.BUILDER_MISSING_BUILD_METHOD.throw();}

}