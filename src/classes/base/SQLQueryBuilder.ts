import {QueryBuilder} from "./QueryBuilder";
import {QueryType} from "./QueryType";
import {Errors} from "./Errors";
import {Module} from "../abstract/Module";
import {Query} from "../../interfaces/Query";
import {WhereBuilder} from "./WhereBuilder";
import {HavingBuilder} from "./HavingBuilder";
import {QueryEvent} from "../../interfaces/QueryEvent";

export class SQLQueryBuilder {

    protected builder : QueryBuilder;

    constructor(builder: QueryBuilder) {
        this.builder = builder;
    }

    private addTable(builder: QueryBuilder, sql: string) : string {
        const table : string = (builder.table as typeof Module).table;
        sql += ` ${table}`;
        return sql;
    }

    public toQuery() : Query & QueryEvent {
        let sql : string = "";
        let values : any[] = [];

        const table : string = (this.builder.table as typeof Module).table;

        const queryInfo : QueryEvent = {table: table, type: this.builder.queryType}
        const errorRes : Query & QueryEvent = {sql: "Error!", params: [], ...queryInfo}

        // ----------------------------------

        const builder : QueryBuilder = this.builder;
        const type : QueryType = builder.queryType;

        // #----------- QUERY TYPE AND NEXT WORD -----------#
        sql += type.type
        if (type.nextWord) sql += ` ${type.nextWord}`;

        // #----------- AFTER TYPE -----------#
        switch (type) {
            case QueryType.SELECT: {
                const select = builder.whatSelect;
                if (!select) {
                    Errors.MISSING_SELECT_FIELD_IN_SELECT_QUERY.throw();
                    return errorRes;
                }
                sql += ` ${select.selects.join(', ')} FROM`;
                sql = this.addTable(builder, sql);
                break;
            }
            case QueryType.DROP: {
                return {sql: this.addTable(builder, sql), params: [], ...queryInfo}
            }
            case QueryType.UPDATE: {
                sql = this.addTable(builder, sql)
                break;
            }
            case QueryType.INSERT: {
                sql = this.addTable(builder, sql)
                break;
            }
            case QueryType.DELETE: {
                sql = this.addTable(builder, sql)
                break;
            }
            case QueryType.TRUNCATE: {
                return {sql: this.addTable(builder, sql), params: [], ...queryInfo}
            }
        }

        // #----------- INSERT -----------#
        if (type == QueryType.INSERT) {
            const insert = builder.whatInsert;
            if (!insert) {
                Errors.MISSING_INSERT_FIELDS.throw();
                return errorRes
            }
            sql += ` ${insert.toQuery}`;
            values = [...values, ...insert.getValues];
            return {sql, params: values, ...queryInfo};
        }

        // #----------- UPDATE -----------#

        if (type === QueryType.UPDATE) {
            const sets = builder.whatUpdate;
            if (!sets || sets.updates.length < 1) {
                Errors.MISSING_UPDATE_FIELDS.throw();
                return errorRes;
            }
            sql += ` SET ${sets.updates.join(', ')}`;
            values = [...values, ...sets.values];
        }

        // #----------- WHERE CLAUSE -----------#
        if (type === QueryType.UPDATE && builder.where) {
            const where : WhereBuilder = builder.where;
            sql += ` WHERE ${where.toString()}`;
            values = [...values, ...where.getValues()];
        }
        if (type === QueryType.SELECT && builder.where) {
            const where : WhereBuilder = builder.where;
            sql += ` WHERE ${where.toString()}`;
            values = [...values, ...where.getValues()];
        }
        if (type === QueryType.DELETE && builder.where) {
            const where : WhereBuilder = builder.where;
            sql += ` WHERE ${where.toString()}`;
            values = [...values, ...where.getValues()];
        }

        // #----------- ORDER BY column DESC -----------#
        if (builder.desc) {
            sql += ` ORDER BY ${builder.desc} DESC`
        }

        // #----------- LIMIT limit -----------#
        if (builder.limit) {
            sql += ` LIMIT ${builder.limit}`
        }

        // #----------- GROUP BY column -----------#
        if (builder.group) {
            sql += ` GROUP BY ${builder.group}`
        }

        // #----------- HAVING -----------#
        if (builder.having) {
            const having : HavingBuilder = builder.having;
            sql += ` HAVING ${having.getCondition()}`;
            values = [...values, ...having.getValues()];
        }

        // #----------- OFFSET -----------#
        if (builder.offset) {
            sql += ` OFFSET ${builder.offset}`;
        }

        // ----------------------------------
        return {sql, params: values, ...queryInfo};
    }

}