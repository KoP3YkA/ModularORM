import {Module} from "../abstract/Module";
import {OrNull} from "../../types/Or";
import {System} from "../../namespaces/System";
import {ExistingColumn} from "../../types/ExistingColumn";
import {ClassConstructor} from "../../types/ClassConstructor";
import {Relation} from "../../interfaces/Relation";
import {IJoinTable} from "../../interfaces/JoinTableInterface";
import {ModularORMException} from "../base/ModularORMException";

export class ModuleSchema {

    constructor(public module : ClassConstructor<Module>) {}

    public getName() : string {
        return System.TABLES_NAMES.get(this.module) ?? (this.module as any).table
    }

    public getAutoincrementKey() : OrNull<string> {
        const columns = Reflect.getMetadata("columns", this.module) || [];
        let primaryKey : string | undefined = (columns as any[]).find(obj => obj.params.autoIncrement === true)?.propertyKey;
        if (!primaryKey) return null;
        return primaryKey;
    }

    public getAutoincrementKeyByResult(module: ClassConstructor<Module>) : OrNull<string> {
        const autoIncrementKey : string | null = new ModuleSchema(module).getAutoincrementKey();
        if (!autoIncrementKey) return null;
        if (module === this.module.constructor) return autoIncrementKey;
        const prototype = module.prototype;
        const resultMappings: Array<{ propertyKey: string, columnName: string }> =
            Reflect.getMetadata('resultAnnotations-mapping-list', this.module) || [];
        for (const { propertyKey, columnName } of resultMappings) {
            if (columnName === autoIncrementKey) {
                return propertyKey;
            }
        }
        return null;
    }

    public getOriginalAutoIncrement(module: ClassConstructor<Module>) : OrNull<string> {
        const autoIncrementKey : string | null = new ModuleSchema(module).getAutoincrementKey();
        if (!autoIncrementKey) return null;
        if (module === this.module.constructor) return autoIncrementKey;
        const prototype = module.prototype;
        const resultMappings: Array<{ propertyKey: string, columnName: string }> =
            Reflect.getMetadata('resultAnnotations-mapping-list', prototype) || [];
        for (const { propertyKey, columnName } of resultMappings) {
            if (columnName === autoIncrementKey) {
                return propertyKey;
            }
        }
        return null;
    }

    public getSoftDeleteColumn() : OrNull<string> {
        const softDeleteColumn = System.SOFT_DELETE_COLUMNS.get(this.module);
        return softDeleteColumn ?? null;
    }

    public getColumns() : ExistingColumn[] {
        const columns = Reflect.getMetadata("columns", this.module) || [];
        return columns as ExistingColumn[];
    }

    public getResultName(name: string) : string {
        const prototype = this.module.prototype;
        const resultMappings: Array<{ propertyKey: string, columnName: string }> =
            Reflect.getMetadata('resultAnnotations-mapping-list', prototype) || [];
        for (const { propertyKey, columnName } of resultMappings) {
            if (columnName === name) {
                return propertyKey;
            }
        }
        return name
    }

    public getOneToManyRelations() : Relation[] {
        let result : Relation[] = []
        for (const i of System.ONE_TO_MANY) {
            if (i.target === this.module) result.push(i)
        }
        return result;
    }

    public getManyToManyRelations() : Relation[] {
        let result : Relation[] = []
        for (const i of System.MANY_TO_MANY) {
            if (i.target === this.module) result.push(i)
        }
        return result;
    }

    public getJoinTableName(relation: Relation) : { table: string, joinColumn: string, inverseJoinColumn: string, isCurrentIsJoin: boolean } {
        let joinColumn : Relation | undefined = undefined;
        let inverseJoinColumn : Relation | undefined = undefined;
        for (const i of System.JOIN_TABLES) {
            if (i.target === this.module) joinColumn = relation;
        }
        for (const i of System.MANY_TO_MANY) {
            if (i.table() === this.module) {
                if (!joinColumn) {
                    joinColumn = i;
                    inverseJoinColumn = relation;
                } else {
                    inverseJoinColumn = i;
                }
            }
        }

        if (!joinColumn || !inverseJoinColumn) throw new ModularORMException('ManyToMany relations can\'t be one-sided.')

        let joinTable : IJoinTable | undefined = undefined;
        for (const i of System.JOIN_TABLES) {
            if (i.target === joinColumn.target) joinTable = i;
            if (i.target === inverseJoinColumn.target) throw new ModularORMException('JoinTable cannot be two-sided')
        }

        if (!joinTable) throw new ModularORMException('ManyToMany relationships must have a JoinColumn')

        let name : string;

        if (joinTable.name) name = joinTable.name;
        else name = `${new ModuleSchema(joinColumn.target as any).getName()}_${new ModuleSchema(inverseJoinColumn.target as any).getName()}`

        return { table: name, joinColumn: joinColumn.propertyKey, inverseJoinColumn: inverseJoinColumn.propertyKey, isCurrentIsJoin: joinColumn === relation };
    }

    public getJoinTableAndManyToMany() {
        
    }

    public static fromName(tableName: string) : OrNull<ModuleSchema> {
        const result = System.TABLES.get(tableName);
        if (result === undefined) return null;
        return new ModuleSchema(result);
    }

}