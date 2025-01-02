import {BaseBuilder} from "../abstract/BaseBuilder";
import {QueryType} from "./QueryType";
import {Module} from "../abstract/Module";
import {OrNull} from "../../types/Or";
import {WhereBuilder} from "./WhereBuilder";
import {SelectBuilder} from "./SelectBuilder";
import {HavingBuilder} from "./HavingBuilder";
import {FinalQuery} from "./FinalQuery";
import {UpdateBuilder} from "./UpdateBuilder";
import {InsertBuilder} from "./InsertBuilder";

export class QueryBuilder extends BaseBuilder {

    public queryType!: QueryType;
    public table!: Module;
    
    public whatSelect?: SelectBuilder;
    public whatUpdate?: UpdateBuilder;
    public whatInsert?: InsertBuilder

    public where : OrNull<WhereBuilder> = null;
    public desc : OrNull<string> = null;
    public limit : OrNull<number> = null;
    public group : OrNull<string> = null;
    public having : OrNull<HavingBuilder> = null;
    public offset : OrNull<number> = null;

    public constructor() {
        super();
    }

    /**
     * Set query type (INSERT, DELETE and more)
     * @param type - QueryType
     */
    public setType(type: QueryType) : QueryBuilder {
        this.queryType = type;
        return this;
    }

    /**
     * Add INSERT values
     * @param insert - InsertBuilder
     */
    public setInsert(insert: InsertBuilder) : QueryBuilder {
        this.whatInsert = insert;
        return this;
    }

    /**
     * Sets up a table
     * @param table - any class extends Module
     */
    public setTable(table: Module) : QueryBuilder {
        this.table = table;
        return this;
    }

    /**
     * Sets what needs to be taken from the table
     * @param select - SelectBuilder
     */
    public setSelect(select: SelectBuilder) : QueryBuilder {
        this.whatSelect = select;
        return this;
    }

    /**
     * Adds a WHERE query
     * @param where - WhereBuilder
     */
    public setWhere(where: WhereBuilder) : QueryBuilder {
        this.where = where;
        return this;
    }

    /**
     * Sets the ORDER BY column DESC query
     * @param column - name of column
     */
    public setDesc(column: string) : QueryBuilder {
        this.desc = column;
        return this;
    }

    /**
     * Sets a limit
     * @param limit - limit, number
     */
    public setLimit(limit: number) : QueryBuilder {
        this.limit = limit;
        return this;
    }

    /**
     * Sets GROUP BY query
     * @param column - name of column
     */
    public setGroup(column: string) : QueryBuilder {
        this.group = column;
        return this;
    }

    /**
     * Sets HAVING
     * @param having - HavingBuilder
     */
    public setHaving(having: HavingBuilder) : QueryBuilder {
        this.having = having;
        return this;
    }

    /**
     * Sets OFFSET
     * @param offset - offset, number
     */
    public setOffset(offset: number) : QueryBuilder {
        this.offset = offset;
        return this;
    }

    /**
     * Use in UPDATE query's
     * @param update - UpdateBuilder
     */
    public setUpdate(update: UpdateBuilder) : QueryBuilder {
        this.whatUpdate = update;
        return this;
    }

    public build(): FinalQuery {return new FinalQuery(this);}

}