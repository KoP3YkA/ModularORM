import {Module} from "../abstract/Module";
import {ModelAdapter} from "../adapter/ModelAdapter";
import {SelectQueryParams} from "../../interfaces/SelectQueryParams";
import {QueryBuilder} from "./QueryBuilder";
import {DatabaseAPI} from "./DatabaseAPI";
import {Nothing} from "../../types/Nothing";
import Table from 'cli-table3';
import {ColumnType} from "./ColumnType";
import chalk from "chalk";
import {SqlFunctions} from "./SqlFunctions";
import {WhereBlock} from "../../types/WhereBlock";
import {AdditionalParams} from "../../types/AdditionalParams";
import {System} from "../../namespaces/System";
import {Logger} from "../Logger";
import {QueryIs} from "./QueryIs";
import {TableFieldBlock} from "../../types/TableFieldBlock";
import {OrNull} from "../../types/Or";
import {ClassConstructor} from "../../types/ClassConstructor";
import {ModuleSchema} from "../adapter/ModuleSchema";
import {PropertyName} from "../adapter/GetPropertyName";
import {Relation} from "../../interfaces/Relation";
import {ManyToManyKeys} from "../../types/ManyToManyKeys";
import {QueryType} from "./QueryType";
import {ModularORMException} from "./ModularORMException";
import {HandleExceptions} from "../../decorators/HandleExceptions";
import {TableFieldStrings} from "../../types/TableFieldStrings";
import {WhereAdapter} from "../adapter/WhereAdapter";

export class Repository<T extends Module, B extends Object = T> {
    private moduleClassSchema : ModuleSchema;
    private resultClassSchema : ModuleSchema;

    constructor(private moduleClass : ClassConstructor<T>, private resultClass : ClassConstructor<B> = moduleClass as any) {
        this.moduleClassSchema = new ModuleSchema(moduleClass);
        this.resultClassSchema = new ModuleSchema(resultClass);
    }

    private async handleManyToOneRelations(results: B[], relations?: (string | ClassConstructor<Module>)[]) : Promise<B[]> {
        const oneToManyRelations : Relation[] = this.resultClassSchema.getOneToManyRelations();
        const newRelations : string[] = relations?.map(obj => {
            if (typeof obj !== 'string') return new ModuleSchema(obj).getName();
            return obj;
        }) ?? [];
        for (const i of oneToManyRelations) {
            const targetName = new ModuleSchema(i.table() as any).getName();
            let referenceColumnName : string = PropertyName.getPropertyName(i.column);
            referenceColumnName = new ModuleSchema(i.result ? i.result() : this.moduleClass as any).getResultName(referenceColumnName);
            const referenceTable : ClassConstructor<Module> = i.table() as ClassConstructor<Module>;
            const referenceResult : ClassConstructor<Object> = i.result ? i.result() as ClassConstructor<Object> : referenceTable;

            let relationsResult : Object[] = [];
            if (i.loadType !== 'mixed' || newRelations.includes(targetName)) {
                relationsResult = await new ModelAdapter(referenceTable).select(referenceResult, {}, {});
            }

            const relationMap = new Map<any, Object[]>();

            const selfKey = new ModuleSchema(results[0] as any).getAutoincrementKeyByResult(this.moduleClass as any) ?? 'id';

            for (const rel of relationsResult) {
                const key = rel[referenceColumnName as keyof typeof rel];
                if (!relationMap.has(key)) relationMap.set(key, []);
                relationMap.get(key)!.push(rel);
            }

            for (const b of results) {
                const bKey = b[selfKey as keyof typeof b];
                b[i.propertyKey as keyof typeof b] = relationMap.get(bKey) ?? ([] as any);
            }
        }
        return results;
    }

    public async handleManyToManyRelations(
        results: B[],
        relations?: ((string | ClassConstructor<Module>)[]) | null,
        depth: number = 1
    ): Promise<B[]> {
        const manyToManyRelations: Relation[] = this.resultClassSchema.getManyToManyRelations();
        if (depth <= 0) {
            for (const i of manyToManyRelations) {
                for (const b of results) {
                    b[i.propertyKey as keyof typeof b] = [] as any;
                }
            }
            return results;
        }

        const newRelations: string[] = relations?.map(obj =>
            typeof obj === 'string' ? obj : new ModuleSchema(obj).getName()
        ) ?? [];

        const selfKey = this.moduleClassSchema.getAutoincrementKeyByResult(this.moduleClass as any) ?? 'id';

        const joinResultsMap = new Map<string, any[]>();
        for (const i of manyToManyRelations) {
            const { table } = this.moduleClassSchema.getJoinTableName(i);
            if (!joinResultsMap.has(table)) {
                const joinResults = await new DatabaseAPI().databaseGetQuery({ sql: `SELECT * FROM ${table}`, params: [] });
                joinResultsMap.set(table, joinResults);
            }
        }

        for (const i of manyToManyRelations) {
            const moduleSchema = new ModuleSchema(i.table() as any);
            const targetName = moduleSchema.getName();
            const referenceTable: ClassConstructor<Module> = i.table() as ClassConstructor<Module>;
            const referenceResult = (i.result ?? referenceTable) as ClassConstructor<Module>;
            const referenceSchema = new ModuleSchema(referenceResult);

            const referenceIdKey = referenceSchema.getAutoincrementKeyByResult(referenceTable) ?? 'id';

            const manyToManyData = this.moduleClassSchema.getJoinTableName(i);
            const joinSelfKey = manyToManyData.isCurrentIsJoin ? manyToManyData.inverseJoinColumn : manyToManyData.joinColumn;
            const joinRefKey = manyToManyData.isCurrentIsJoin ? manyToManyData.joinColumn : manyToManyData.inverseJoinColumn;

            const joinResults = joinResultsMap.get(manyToManyData.table) ?? [];

            let relationsResults: Object[] = [];
            const shouldLoad = i.loadType !== 'mixed' || newRelations.includes(targetName) || relations === null;
            if (shouldLoad) {
                relationsResults = await new ModelAdapter(referenceTable).select(referenceResult, {}, {});
            }

            if (relationsResults.length > 0) {
                await new Repository(referenceTable, referenceResult).handleManyToManyRelations(relationsResults as any, relations, depth - 1);
            }

            const relationsMap = new Map<any, any>();
            for (const obj of relationsResults) {
                relationsMap.set(obj[referenceIdKey as keyof typeof obj], obj);
            }

            for (const b of results) {
                const bId = b[selfKey as keyof typeof b];
                const relatedIds = joinResults
                    .filter(jr => jr[joinSelfKey] === bId)
                    .map(jr => jr[joinRefKey]);

                const related = relatedIds
                    .map(id => relationsMap.get(id))
                    .filter(Boolean);

                b[i.propertyKey as keyof typeof b] = related as any;
            }
        }

        return results;
    }

    private async handleRelations(results: B[], relations?: (string | ClassConstructor<Module>)[], depth: number = 1) : Promise<B[]> {
        const manyToOneResults : B[] = await this.handleManyToOneRelations(results, relations);
        return await this.handleManyToManyRelations(manyToOneResults, relations, depth);
    }

    @HandleExceptions()
    public async insert(values: TableFieldBlock<T>) {
        const relations : Relation[] = this.moduleClassSchema.getManyToManyRelations();

        if (relations.length === 0) return await new ModelAdapter(this.moduleClass).create(values);

        const manyToManyData = new Map<string, any[]>();
        for (const rel of relations) {
            if (rel.propertyKey in values) {
                manyToManyData.set(rel.propertyKey, values[rel.propertyKey as keyof typeof values] as any[]);
                delete values[rel.propertyKey as keyof typeof values];
            }
        }

        const primaryKey = this.moduleClassSchema.getAutoincrementKey();
        if (!primaryKey) throw new ModularORMException('Primary key must be');

        const result = await new ModelAdapter(this.moduleClass).create(values);
        if (typeof result !== 'number') throw new ModularORMException('The database did not return a new ID.')

        for (const rel of relations) {
            if (!manyToManyData.has(rel.propertyKey)) continue;

            const joinTable = this.moduleClassSchema.getJoinTableName(rel);
            const relatedEntities = manyToManyData.get(rel.propertyKey)!;

            const inversePrimaryKey = new ModuleSchema(rel.table() as any).getOriginalAutoIncrement(rel.table() as any);
            if (!inversePrimaryKey) throw new ModularORMException('You need to specify the Primary key for relation');

            for (const relatedEntity of relatedEntities) {
                const inverseValue = typeof relatedEntity === 'object' ? relatedEntity[inversePrimaryKey] : relatedEntity;
                await new DatabaseAPI().databaseSetQuery({
                    sql: `INSERT INTO ${joinTable.table} (${joinTable.joinColumn}, ${joinTable.inverseJoinColumn}) VALUES (?, ?)`,
                    params: joinTable.isCurrentIsJoin ? [inverseValue, result] : [result, inverseValue]
                });
            }
        }
    }

    @HandleExceptions(null)
    public async findOne(values: WhereBlock<T> = {}, params?: AdditionalParams<T>) : Promise<B | null> {
        const response : B[] = await new ModelAdapter(this.moduleClass).select(this.resultClass, values, {limit: 1, ...params});
        return response.length === 0 ? null : (await this.handleRelations(response, params?.relations, params?.depth))[0];
    }

    @HandleExceptions([])
    public async find(values: WhereBlock<T> = {}, params?: AdditionalParams<T>) : Promise<B[]> {
        const results = await new ModelAdapter(this.moduleClass).select(this.resultClass, values, params);
        return await this.handleRelations(results, params?.relations, params?.depth);
    }

    @HandleExceptions(null)
    public async update(values: TableFieldBlock<T>, where: WhereBlock<T>) {
        const relations: Relation[] = this.moduleClassSchema.getManyToManyRelations();

        if (relations.length === 0) return await new ModelAdapter(this.moduleClass).update(values, where);

        const manyToManyData = new Map<string, any[]>();

        for (const rel of relations) {
            if (Object.prototype.hasOwnProperty.call(values, rel.propertyKey) && values[rel.propertyKey as keyof typeof values] !== undefined) {
                manyToManyData.set(rel.propertyKey, values[rel.propertyKey as keyof typeof values] as any[]);
                delete values[rel.propertyKey as keyof typeof values];
            }
        }

        if (manyToManyData.size === 0) {
            return await new ModelAdapter(this.moduleClass).update(values, where);
        }

        const primaryKey = this.moduleClassSchema.getAutoincrementKey();
        if (!primaryKey) throw new ModularORMException('Primary key must be');

        const recordsToUpdate = await new ModelAdapter(this.moduleClass).select(this.moduleClass, where, {  });
        await new ModelAdapter(this.moduleClass).update(values, where);

        if (manyToManyData.size > 0) {
            for (const record of recordsToUpdate) {
                const recordId = record[primaryKey as keyof typeof record];
                for (const rel of relations) {
                    if (!manyToManyData.has(rel.propertyKey)) continue;

                    const joinTable = this.moduleClassSchema.getJoinTableName(rel);
                    const relatedEntities = manyToManyData.get(rel.propertyKey)!;
                    const inversePrimaryKey = new ModuleSchema(rel.table() as any).getOriginalAutoIncrement(rel.table() as any);
                    if (!inversePrimaryKey) throw new ModularORMException('You need to specify the Primary key for relation');

                    await new DatabaseAPI().databaseSetQuery({
                        sql: `DELETE FROM ${joinTable.table} WHERE ${joinTable.isCurrentIsJoin ? joinTable.inverseJoinColumn : joinTable.joinColumn} = ?`,
                        params: [recordId]
                    });

                    for (const relatedEntity of relatedEntities) {
                        const inverseValue = typeof relatedEntity === 'object' ? relatedEntity[inversePrimaryKey] : relatedEntity;
                        await new DatabaseAPI().databaseSetQuery({
                            sql: `INSERT INTO ${joinTable.table} (${joinTable.joinColumn}, ${joinTable.inverseJoinColumn}) VALUES (?, ?)`,
                            params: joinTable.isCurrentIsJoin ? [inverseValue, recordId] : [recordId, inverseValue]
                        });
                    }
                }
            }
        }

    }

    @HandleExceptions(null)
    public async delete(where: WhereBlock<T>) {
        const relations: Relation[] = this.moduleClassSchema.getManyToManyRelations();
        if (relations.length === 0) return await new ModelAdapter(this.moduleClass).delete(where);

        const primaryKey = this.moduleClassSchema.getAutoincrementKey();
        if (!primaryKey) throw new ModularORMException('Primary key must be specified');

        const recordsToDelete = await new ModelAdapter(this.moduleClass).select(this.moduleClass, where, {});

        for (const record of recordsToDelete) {
            const recordId = record[primaryKey as keyof typeof record];
            for (const rel of relations) {
                const joinTable = this.moduleClassSchema.getJoinTableName(rel);
                await new DatabaseAPI().databaseSetQuery({
                    sql: `DELETE FROM ${joinTable.table} WHERE ${joinTable.isCurrentIsJoin ? joinTable.inverseJoinColumn : joinTable.joinColumn} = ?`,
                    params: [recordId]
                });
            }
        }

        return await new ModelAdapter(this.moduleClass).delete(where);
    }

    @HandleExceptions()
    public queryBuilder() : QueryBuilder {
        return new QueryBuilder().setTable(this.moduleClass)
    }

    @HandleExceptions({})
    public async query(sql: string, escape?: any[]) : Promise<Record<any, any>> {
        return await new DatabaseAPI().databaseGetQuery({
            sql,
            params: escape ?? []
        }) as Record<any, any>;
    }

    @HandleExceptions(null)
    public async save(obj: T) {
        const columns = Reflect.getMetadata("columns", this.moduleClass) || [];
        let primaryKey : string | undefined = (columns as any[]).find(obj => obj.params.autoIncrement === true)?.propertyKey;
        if (!primaryKey || !(obj as any)[primaryKey]) return await this.insert(obj);
        const key = primaryKey as keyof T;
        const { [key]: _, ...rest } = obj as any;
        const keyAsPartial = { [key]: obj[key] } as Partial<T>;
        await this.update(rest, keyAsPartial)
    }

    @HandleExceptions(null)
    public async remove(obj: T) {
        const result = await this.findOne(obj);
        if (!result) throw new ModularORMException('Entity not found');
        await this.delete(obj);
    }

    @HandleExceptions()
    public async startTransaction() : Nothing {
        return new DatabaseAPI().startTransaction();
    }

    @HandleExceptions()
    public async commitTransaction() : Nothing {
        return new DatabaseAPI().commitTransaction();
    }

    @HandleExceptions()
    public async rollbackTransaction() : Nothing {
        return new DatabaseAPI().rollback();
    }

    @HandleExceptions(false)
    public async exists(where: WhereBlock<T> = {}) : Promise<boolean> {
        return !!(await this.findOne(where));
    }

    @HandleExceptions()
    public async count(where: WhereBlock<T> = {}) : Promise<number> {
        return (await this.find(where)).length;
    }

    @HandleExceptions()
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

    @HandleExceptions(null)
    public async softDelete(where: WhereBlock<T>) {
        const softDeleteColumn = System.SOFT_DELETE_COLUMNS.get(this.moduleClass);
        if (!softDeleteColumn) throw new ModularORMException('Cannot find SoftDelete column in this module');
        await this.update({ [softDeleteColumn as keyof T]: new Date() } as Partial<T>, {[softDeleteColumn as keyof T]: QueryIs.NULL, ...where});
    }

    @HandleExceptions([])
    public async softFind(values: WhereBlock<T> = {}, params?: AdditionalParams<T>) : Promise<B[]> {
        const softDeleteColumn = System.SOFT_DELETE_COLUMNS.get(this.moduleClass);
        if (!softDeleteColumn) {
            throw new ModularORMException('Cannot find SoftDelete column in this module')
        }
        const results = await this.find({...values, [softDeleteColumn as keyof T]: QueryIs.NULL}, params)
        return await this.handleRelations(results, params?.relations, params?.depth);
    }

    @HandleExceptions(null)
    public async softFindOne(values: WhereBlock<T> = {}, params?: AdditionalParams<T>) : Promise<B | null> {
        const softDeleteColumn = System.SOFT_DELETE_COLUMNS.get(this.moduleClass);
        if (!softDeleteColumn) {
            throw new ModularORMException('Cannot find SoftDelete column in this module')
        }
        const result = await this.findOne({...values, [softDeleteColumn as keyof T]: QueryIs.NULL}, params)
        if (result === null) return null;
        return (await this.handleRelations([result], params?.relations, params?.depth))[0]
    }

    @HandleExceptions(null)
    public async clone(edit: TableFieldBlock<T>, where: WhereBlock<T>, params?: AdditionalParams<T>, insert?: TableFieldStrings<T>) : Nothing {
        const schema : ModuleSchema = this.moduleClassSchema;
        const columns : string = schema.getAllColumnsWithoutAutoIncrement(insert as string[]);
        const name : string = schema.getName();
        const cloneColumns : string = schema.getAllColumnsToClone<T>(edit, insert as string[]);
        const whereSql = WhereAdapter.adapt<T>(where, params);
        await new DatabaseAPI().databaseSetQuery({
            sql: `INSERT INTO ${name} (${columns}) SELECT ${cloneColumns} FROM ${name} WHERE ${whereSql.sql}`,
            params: whereSql.values
        })
    }

    @HandleExceptions(null)
    public async updateInstance(instance: T | B, params?: AdditionalParams<T>) : Nothing {
        const primaryKey = new ModuleSchema(instance as any).getAutoincrementKeyByResult(this.moduleClass);
        const originalPrimaryKey = this.moduleClassSchema.getAutoincrementKey()
        if (!primaryKey || !originalPrimaryKey) return;
        const result = await new Repository(this.moduleClass, instance.constructor as any).findOne({ [originalPrimaryKey as keyof typeof this.moduleClass]: instance[primaryKey as keyof typeof instance] as any }, params)
        if (!result) return;
        Object.assign(instance, result)
    }

    @HandleExceptions([])
    public async findByAutoincrementKey(id: number, params?: AdditionalParams<T>) : Promise<B[]> {
        const columns = Reflect.getMetadata("columns", this.moduleClass) || [];
        let primaryKey : string | undefined = (columns as any[]).find(obj => obj.params.autoIncrement === true)?.propertyKey;
        if (!primaryKey) return [];
        const results = await this.find({ [primaryKey as keyof T]: id } as Partial<T>, params);
        return await this.handleRelations(results, params?.relations, params?.depth);
    }

    @HandleExceptions(null)
    public async findOneByAutoincrementKey(id: number, params?: AdditionalParams<T>) : Promise<OrNull<B>> {
        const columns = Reflect.getMetadata("columns", this.moduleClass) || [];
        let primaryKey : string | undefined = (columns as any[]).find(obj => obj.params.autoIncrement === true)?.propertyKey;
        if (!primaryKey) return null;
        const result = await this.findOne({ [primaryKey as keyof T]: id } as Partial<T>, params);
        if (result === null) return null;
        return (await this.handleRelations([result], params?.relations, params?.depth))[0]
    }

    @HandleExceptions()
    public async findOrFail(values: WhereBlock<T> = {}, params?: AdditionalParams<T>) : Promise<B> {
        const result = await this.findOne(values, params);
        if (!result) throw new ModularORMException('Result is null!')
        return (await this.handleRelations([result], params?.relations, params?.depth))[0]
    }

    @HandleExceptions(null)
    public async addRelation<
        K extends ManyToManyKeys<T>,
        R = T[K] extends (infer U)[] ? U : never
    >(
        relation: K,
        entityId: number,
        relatedEntity: number | R
    ): Promise<void> {
        const rel = this.moduleClassSchema.getManyToManyRelations().find(r => r.propertyKey === relation);
        if (!rel) throw new ModularORMException(`Relation ${String(relation)} not found`);

        const joinTable = this.moduleClassSchema.getJoinTableName(rel);
        const primaryKey = new ModuleSchema(rel.table() as any).getOriginalAutoIncrement(rel.table() as any)
        if (!primaryKey) throw new ModularORMException('Primary key must be')
        const relatedId = typeof relatedEntity === 'object'
            ? (relatedEntity as any)[primaryKey as keyof typeof relatedEntity]
            : relatedEntity;

        await new DatabaseAPI().databaseSetQuery({
            sql: `INSERT INTO ${joinTable.table} (${joinTable.joinColumn}, ${joinTable.inverseJoinColumn}) VALUES (?, ?)`,
            params: joinTable.isCurrentIsJoin ? [relatedId, entityId] : [entityId, relatedId]
        });
    }

    @HandleExceptions(null)
    public async removeRelation<
        K extends ManyToManyKeys<T>,
        R = T[K] extends (infer U)[] ? U : never
    >(
        relation: K,
        entityId: number,
        relatedEntity: number | R
    ): Promise<void> {
        const rel = this.moduleClassSchema.getManyToManyRelations().find(r => r.propertyKey === relation);
        if (!rel) throw new ModularORMException(`Relation ${String(relation)} not found`);

        const joinTable = this.moduleClassSchema.getJoinTableName(rel);
        const primaryKey = new ModuleSchema(rel.table() as any).getOriginalAutoIncrement(rel.table() as any)
        if (!primaryKey) throw new ModularORMException('Primary key must be')
        const relatedId = typeof relatedEntity === 'object'
            ? (relatedEntity as any)[primaryKey as keyof typeof relatedEntity]
            : relatedEntity;

        await new DatabaseAPI().databaseSetQuery({
            sql: `DELETE FROM ${joinTable.table} WHERE ${joinTable.joinColumn} = ? AND ${joinTable.inverseJoinColumn} = ?`,
            params: joinTable.isCurrentIsJoin ? [relatedId, entityId] : [entityId, relatedId]
        });
    }

    @HandleExceptions(null)
    public async deleteAllManyToManyRelations<
        K extends ManyToManyKeys<T>,
    >(relation: K) : Nothing {
        const rel = this.moduleClassSchema.getManyToManyRelations().find(r => r.propertyKey === relation);
        if (!rel) throw new ModularORMException(`Relation ${String(relation)} not found`);
        const joinTable = this.moduleClassSchema.getJoinTableName(rel);
        await new DatabaseAPI().databaseSetQuery({
            sql: `TRUNCATE TABLE ${joinTable.table}`,
            params: []
        })
    }

    @HandleExceptions(null)
    public async deleteAll() : Nothing {
        await new QueryBuilder().setTable(this.moduleClass).setType(QueryType.DELETE).build().execute();
        await new DatabaseAPI().databaseSetQuery({
            sql: `ALTER TABLE ${this.moduleClassSchema.getName()} AUTO_INCREMENT = 1`,
            params: []
        })
    }

}