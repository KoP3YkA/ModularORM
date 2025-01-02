import {BaseBuilder} from "../abstract/BaseBuilder";
import {Errors} from "./Errors";

export class UpdateBuilder extends BaseBuilder {

    public updates: string[] = [];
    public values: any[] = [];

    public constructor() {
        super();
    }

    public add(column: string, value: any) : this {
        this.updates.push(`${column} = ?`);
        this.values.push(value);
        return this;
    }

    public build(t: any): any {Errors.BUILDER_DONT_HAVE_BUILD_METHOD.throw();}

}