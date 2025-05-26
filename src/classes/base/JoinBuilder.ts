import {BaseBuilder} from "../abstract/BaseBuilder";
import {Errors} from "./Errors";
import {JoinType} from "../../types/JoinType";
import {WhereBuilder} from "./WhereBuilder";
import {Module} from "../abstract/Module";

export class JoinBuilder extends BaseBuilder {
    private joinType: JoinType = 'INNER';
    private table!: string;
    private alias?: string;
    private onCondition!: WhereBuilder;

    public constructor() {
        super();
    }

    public setType(joinType: JoinType) : JoinBuilder {
        this.joinType = joinType;
        return this;
    }

    public setTable(table: string | Module) : JoinBuilder {
        this.table = typeof table === 'string' ? table : (table as typeof Module).table
        return this;
    }

    public setAlias(alias: string) : JoinBuilder {
        this.alias = alias;
        return this;
    }

    public setOn(where: WhereBuilder) : JoinBuilder {
        this.onCondition = where;
        return this;
    }

    private resolveCondition(): string {
        const raw = this.onCondition.toString();
        const values = this.onCondition.getValues();

        let index = 0;

        return raw.replace(/\?/g, () => {
            const val = values[index++];
            const isColumn = typeof val === 'string' && /^[a-zA-Z_]\w*\.[a-zA-Z_]\w*$/.test(val);
            if (isColumn) return val;
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val === null) return 'NULL';
            return String(val);
        });
    }

    public toQuery(): string {
        const aliasPart = this.alias ? ` AS ${this.alias}` : '';
        const resolvedOn = this.resolveCondition();
        return `${this.joinType} JOIN ${this.table}${aliasPart} ON ${resolvedOn}`;
    }

    public build(t: any): any {Errors.BUILDER_MISSING_BUILD_METHOD.throw();}
}