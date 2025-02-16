import {BaseBuilder} from "../abstract/BaseBuilder";
import {Errors} from "./Errors";

export class SelectBuilder extends BaseBuilder {

    public selects: string[] = [];

    public constructor() {
        super();
    }

    /**
     * Add *
     */
    public addAll() : SelectBuilder {
        this.selects.push('*');
        return this;
    }

    /**
     * Add default name to selects
     * @param name
     */
    public addColumn(name: string) : SelectBuilder {
        this.selects.push(name)
        return this;
    }

    /**
     * Count of returned columns
     * @param column
     * @param as
     */
    public addCount(column: string, as: string = '') : SelectBuilder {
        this.push('count', column, as);
        return this;
    }

    /**
     * Sum of returned default values
     * @param column
     * @param as
     */
    public addSum(column: string, as: string = '') : SelectBuilder {
        this.push('sum', column, as);
        return this;
    }

    /**
     * Returns the average of the specified default
     * @param column
     * @param as
     */
    public addAvg(column: string, as: string = '') : SelectBuilder {
        this.push('sum', column, as);
        return this;
    }

    /**
     * Returns the minimum value in the specified default.
     * @param column
     * @param as
     */
    public addMin(column: string, as: string = '') : SelectBuilder {
        this.push('sum', column, as);
        return this;
    }

    /**
     * Returns the maximum value in the specified default.
     * @param column
     * @param as
     */
    public addMax(column: string, as: string = '') : SelectBuilder {
        this.push('sum', column, as);
        return this;
    }

    private push(name: string, column: string, as: string) {
        const asValue : string = as == '' ? '' : ` AS ${as}`
        this.selects.push(`${name.toUpperCase()}(${column})${asValue}`)
    }

    public build(t: any): any {Errors.BUILDER_MISSING_BUILD_METHOD.throw();}

}