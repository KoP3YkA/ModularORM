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
import {JoinBuilder} from "./JoinBuilder";
import {HandleExceptions} from "../../decorators/HandleExceptions";

export class QueryBuilder extends BaseBuilder {

    public queryType!: QueryType;
    public table!: Module;
    
    public whatSelect?: SelectBuilder;
    public whatUpdate?: UpdateBuilder;
    public whatInsert?: InsertBuilder

    public where : OrNull<WhereBuilder> = null;
    public desc : string[] = [];
    public limit : OrNull<number> = null;
    public group : OrNull<string> = null;
    public having : OrNull<HavingBuilder> = null;
    public offset : OrNull<number> = null;
    public join : OrNull<JoinBuilder> = null;

    public useCache : boolean = true;
    public cacheTTL : number = 300;

    public constructor() {
        super();
    }

    /**
     * Sets the type of query (e.g., INSERT, DELETE, etc.).
     * @param type - The type of the query (QueryType).
     * @returns The current QueryBuilder instance.
     */
    public setType(type: QueryType) : QueryBuilder {
        this.queryType = type;
        return this;
    }

    /**
     * Specifies the INSERT values for the query.
     * @param insert - An instance of InsertBuilder that defines the values to insert.
     * @returns The current QueryBuilder instance.
     */
    public setInsert(insert: InsertBuilder) : QueryBuilder {
        this.whatInsert = insert;
        return this;
    }

    /**
     * Defines the table to be used in the query.
     * @param table - A class that extends the Module class, representing the table.
     * @returns The current QueryBuilder instance.
     */
    public setTable(table: Module) : QueryBuilder {
        this.table = table;
        return this;
    }

    /**
     * Specifies what to select from the table.
     * @param select - An instance of SelectBuilder that defines the fields to select.
     * @returns The current QueryBuilder instance.
     */
    public setSelect(select: SelectBuilder) : QueryBuilder {
        this.whatSelect = select;
        return this;
    }

    /**
     * Adds a WHERE condition to the query.
     * @param where - An instance of WhereBuilder that defines the WHERE condition.
     * @returns The current QueryBuilder instance.
     */
    public setWhere(where: WhereBuilder) : QueryBuilder {
        this.where = where;
        return this;
    }

    /**
     * Sets the ORDER BY clause with descending order for a specific default.
     * @param column - The name of the default to order by in descending order.
     * @param type
     * @returns The current QueryBuilder instance.
     */
    public addOrder(column: string, type: 'ASC' | 'DESC') : QueryBuilder {
        this.desc.push(`${column} ${type}`);
        return this;
    }

    /**
     * Limits the number of results returned by the query.
     * @param limit - The maximum number of results to return.
     * @returns The current QueryBuilder instance.
     */
    public setLimit(limit: number) : QueryBuilder {
        this.limit = limit;
        return this;
    }

    /**
     * Specifies a GROUP BY clause for the query.
     * @param column - The name of the default to group by.
     * @returns The current QueryBuilder instance.
     */
    public setGroup(column: string) : QueryBuilder {
        this.group = column;
        return this;
    }

    /**
     * Adds a HAVING condition to the query.
     * @param having - An instance of HavingBuilder that defines the HAVING condition.
     * @returns The current QueryBuilder instance.
     */
    public setHaving(having: HavingBuilder) : QueryBuilder {
        this.having = having;
        return this;
    }

    /**
     * Specifies an OFFSET value for the query.
     * @param offset - The number of rows to skip before starting to return rows.
     * @returns The current QueryBuilder instance.
     */
    public setOffset(offset: number) : QueryBuilder {
        this.offset = offset;
        return this;
    }

    /**
     * Specifies the UPDATE values for the query.
     * @param update - An instance of UpdateBuilder that defines the fields to update.
     * @returns The current QueryBuilder instance.
     */
    public setUpdate(update: UpdateBuilder) : QueryBuilder {
        this.whatUpdate = update;
        return this;
    }

    public setUseCache(use: boolean = true) : QueryBuilder {
        this.useCache = use;
        return this
    }

    public setCacheTTL(ttl: number) : QueryBuilder {
        this.cacheTTL = ttl;
        return this;
    }

    public setJoin(join: JoinBuilder) : QueryBuilder {
        this.join = join;
        return this;
    }

    public build(): FinalQuery {return new FinalQuery(this);}

}