import {Module} from "../abstract/Module";
import {QueryBuilder} from "../base/QueryBuilder";
import {QueryType} from "../base/QueryType";
import {InsertBuilder} from "../base/InsertBuilder";
import {Nothing} from "../../types/Nothing";
import {SelectQueryParams} from "../../interfaces/SelectQueryParams";
import {SelectBuilder} from "../base/SelectBuilder";
import {WhereBuilder} from "../base/WhereBuilder";
import {UpdateBuilder} from "../base/UpdateBuilder";
import {ClassConstructor} from "../../types/ClassConstructor";

export class ModelAdapter<B extends Module>{

    public constructor(
        public module : ClassConstructor<B>
    ) {}

    private getWhereBuilder(where: { [key: string] : any }) : WhereBuilder {
        const whereBuilder : WhereBuilder = new WhereBuilder();

        for (const i of Object.keys(where)) {
            const value = where[i]
            if (Array.isArray(value)) {
                if (value.length === 1) value.forEach(obj => whereBuilder.equalOr(i, obj))
                else {
                    const subbuilder = new WhereBuilder()
                    value.forEach(obj => subbuilder.equalOr(i, obj))
                    whereBuilder.addSubQuery(subbuilder)
                }
            } else whereBuilder.equalAnd(i, value)
        }

        return whereBuilder
    }

    public async create(values: { [key: string]: any }) : Nothing {
        const insert : InsertBuilder = new InsertBuilder(true);

        for (const i of Object.keys(values)) {
            insert.add(i, values[i])
        }

        const builder : QueryBuilder = new QueryBuilder();
        builder.setTable(this.module)
        builder.setType(QueryType.INSERT)
        builder.setInsert(insert)

        return await builder.build().execute();
    }

    public async select<T extends Object>(ctor: new (...args: any[]) => T, where: { [key: string] : any }, params?: Partial<SelectQueryParams<B>>) : Promise<T[]> {
        const whereBuilder : WhereBuilder = this.getWhereBuilder(where);

        const builder : QueryBuilder = new QueryBuilder();
        builder.setTable(this.module)
        builder.setType(QueryType.SELECT)
        builder.setSelect(new SelectBuilder().addAll())
        builder.setUseCache(params?.useCache)
        builder.setCacheTTL(params?.cacheTTL ?? 300)
        if (Object.keys(where).length > 0) builder.setWhere(whereBuilder)

        if (params?.order && typeof params.order === "object") {
            Object.entries(params.order).forEach(([key, value]) => {
                builder.addOrder(key, value as 'ASC' | 'DESC');
            });
        }
        if (params?.limit) builder.setLimit(params.limit)
        if (params?.offset) builder.setOffset(params.offset)

        return builder.build().get<T>(ctor);

    }

    public async update(newValues: { [key: string] : any }, where?: { [key: string] : any }) : Nothing {
        const updateBuilder : UpdateBuilder = new UpdateBuilder();

        for (const i of Object.keys(newValues)) {
            updateBuilder.add(i, newValues[i])
        }

        const builder : QueryBuilder = new QueryBuilder();
        builder.setTable(this.module)
        builder.setType(QueryType.UPDATE)
        builder.setUpdate(updateBuilder)

        if (where && Object.keys(where).length > 0) {
            const whereBuilder : WhereBuilder = this.getWhereBuilder(where)
            builder.setWhere(whereBuilder)
        }

        await builder.build().execute();

    }

    public async delete(where: { [key: string] : any }) : Nothing {
        const whereBuilder : WhereBuilder = this.getWhereBuilder(where);

        const builder : QueryBuilder = new QueryBuilder();
        builder.setTable(this.module)
        builder.setType(QueryType.DELETE)
        builder.setWhere(whereBuilder)

        await builder.build().execute();

    }

    public async drop() : Nothing {
        const builder : QueryBuilder = new QueryBuilder();
        builder.setTable(this.module)
        builder.setType(QueryType.DROP)
        await builder.build().execute();
    }

}