import {Module} from "../abstract/Module";
import {ModelAdapter} from "../adapter/ModelAdapter";
import {QueryResult} from "./QueryResult";
import {SelectQueryParams} from "../../interfaces/SelectQueryParams";
import {QueryBuilder} from "./QueryBuilder";
import {DatabaseAPI} from "./DatabaseAPI";

export class Repository<T extends Module, B extends QueryResult> {

    constructor(private moduleClass : { new () : T }, private resultClass : { new () : B }) {}

    public async insert(values: Partial<T>) {
        await new ModelAdapter(this.moduleClass).create(values);
    }

    public async findOne(values: Partial<T> = {}, params?: SelectQueryParams) : Promise<B | null> {
        const response : B[] = await new ModelAdapter(this.moduleClass).select(this.resultClass, values, {limit: 1, ...params});
        return response.length === 0 ? null : response[0];
    }

    public async find(values: Partial<T> = {}, params?: SelectQueryParams) : Promise<B[]> {
        return await new ModelAdapter(this.moduleClass).select(this.resultClass, values, params);
    }

    public async update(values: Partial<T>, where: Partial<T>) {
        return await new ModelAdapter(this.moduleClass).update(values, where);
    }

    public async delete(where: Partial<T>) {
        return await new ModelAdapter(this.moduleClass).delete(where);
    }

    public queryBuilder() : QueryBuilder {
        return new QueryBuilder().setTable(this.moduleClass)
    }

    public async query(sql: string, escape?: any[]) : Promise<Record<any, any>> {
        return await new DatabaseAPI().databaseGetQuery({
            sql,
            params: escape ?? []
        }) as Record<any, any>;
    }

}