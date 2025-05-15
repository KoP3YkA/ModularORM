import {Module} from "../abstract/Module";
import {ModelAdapter} from "../adapter/ModelAdapter";
import {SelectQueryParams} from "../../interfaces/SelectQueryParams";
import {QueryBuilder} from "./QueryBuilder";
import {DatabaseAPI} from "./DatabaseAPI";
import {Nothing} from "../../types/Nothing";
import Table from 'cli-table3';
import {ColumnType} from "./ColumnType";
import chalk from "chalk";
import {Logger} from "../Logger";
import {SqlFunctions} from "./SqlFunctions";

export class Repository<T extends Module, B extends Object = T> {

    constructor(private moduleClass : { new () : T }, private resultClass : { new (...args: any[]) : B } = moduleClass as any) {}

    public async insert(values: Partial<T>) {
        await new ModelAdapter(this.moduleClass).create(values);
    }

    public async findOne(values: Partial<T> = {}, params?: Partial<SelectQueryParams<T>>) : Promise<B | null> {
        const response : B[] = await new ModelAdapter(this.moduleClass).select(this.resultClass, values, {limit: 1, ...params});
        return response.length === 0 ? null : response[0];
    }

    public async find(values: Partial<T> = {}, params?: Partial<SelectQueryParams<T>>) : Promise<B[]> {
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

    public async save(obj: T) {
        try {
            const columns = Reflect.getMetadata("columns", this.moduleClass) || [];
            let primaryKey : string | undefined = (columns as any[]).find(obj => obj.params.autoIncrement === true)?.propertyKey;
            if (!primaryKey || !(obj as any)[primaryKey]) return await this.insert(obj);
            const key = primaryKey as keyof T;
            const { [key]: _, ...rest } = obj as any;
            const keyAsPartial = { [key]: obj[key] } as Partial<T>;
            await this.update(rest, keyAsPartial)
        } catch {}
    }

    public async remove(obj: T) {
        const result = await this.findOne(obj);
        if (!result) throw new Error('Entity not found');
        await this.delete(obj);
    }

    public async startTransaction() : Nothing {
        return new DatabaseAPI().startTransaction();
    }

    public async commitTransaction() : Nothing {
        return new DatabaseAPI().commitTransaction();
    }

    public async rollbackTransaction() : Nothing {
        return new DatabaseAPI().rollback();
    }

    public async exists(where: Partial<T> = {}) : Promise<boolean> {
        return !!(await this.findOne(where));
    }

    public async count(where: Partial<T> = {}) : Promise<number> {
        return (await this.find(where)).length;
    }

    public logTable() : void {
        const table = new Table({
            head: ['Column', 'Type', 'Additional'],
            colWidths: [20, 20, 50]
        })

        const columns = Reflect.getMetadata("columns", this.moduleClass) || [];

        for (const i of columns) {
            const params = i.params;
            const type = params.type as ColumnType
            let additional : string = "";

            if (params.autoIncrement) {
                additional += 'PRIMARY AUTO INCREMENT'
            }

            if (typeof params.notNull === 'boolean') {
                if (params.notNull) additional += ' NOT NULL'
                else additional += ' NULLABLE'
            }

            if (params.defaultValue) {
                if (params.defaultValue instanceof SqlFunctions) additional += ` DEFAULT ${params.defaultValue.name}`
                else additional += ` DEFAULT ${params.defaultValue}`
            }

            table.push([i.propertyKey, type.type, additional])
        }

        console.log(chalk.green(`[ ModularORM ] Table ${this.moduleClass.name}:`))
        console.log(chalk.green(table.toString()))
    }

}