import {BaseBuilder} from "../abstract/BaseBuilder";
import {Errors} from "./Errors";

export class InsertBuilder extends BaseBuilder {

    /**
     * Adds clear indication of columns. For example:
     * true = (column1, column2) VALUES (value1, value2);
     * false = VALUES (value1, value2)
     */
    public separated : boolean;

    public values : Map<string, any> = new Map()

    public constructor(separated: boolean) {
        super();
        this.separated = separated;
    }

    public add(column: string, value: any) : this {
        this.values.set(column, value);
        return this;
    }

    private get getShieldedValues() : string {
        return Array.from(this.values.values())
            .map(obj => '?')
            .join(',')
    }

    public get toQuery(): string {
        if (!this.separated) return `VALUES (${this.getShieldedValues})`
        else return `(${
            Array.from(this.values.keys())
            .join(', ')
        }) VALUES (${this.getShieldedValues})`
    }

    public get getValues() : any[] {return Array.from(this.values.values())}

    public build(t: any): any {Errors.BUILDER_DONT_HAVE_BUILD_METHOD.throw()}

}