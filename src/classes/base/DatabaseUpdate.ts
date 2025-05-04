import 'reflect-metadata'
import {Nothing} from "../../types/Nothing";
import {System} from "../../namespaces/System";
import {InformationSchemaColumns, InformationSchemaColumnsResult} from "../common/InformationSchemaColumns";
import {ColumnType} from "./ColumnType";
import {DatabaseParams} from "../../interfaces/DatabaseParams";
import {MigrationType} from "../../enums/MigrationType";
import {DatabaseAPI} from "./DatabaseAPI";
import {SqlFunctions} from "./SqlFunctions";


type ColumnT = { name: string, type: ColumnType };
type ORMColumn = { autoIncrement: boolean, defaultValue: any, notNull: boolean, unique: boolean, index: boolean, onUpdate: any };

export class DatabaseUpdate {

    public static async updateTables() : Nothing {
        for (const i of System.TABLES_NAMES.keys()) {
            const columns = Reflect.getMetadata("columns", i.constructor) || []

            const results : InformationSchemaColumnsResult[] = await InformationSchemaColumns.select({
                TABLE_SCHEMA: (System.DATABASE_CONNECTION_DATA as DatabaseParams).database,
                TABLE_NAME: System.TABLES_NAMES.get(i) ?? 'error'
            })

            const databaseColumns : ColumnT[] = [];
            const ormColumns : (ColumnT & ORMColumn)[] = [];

            for (const b of columns) {
                const name : string = b.propertyKey as unknown as string;
                const type : ColumnType = b.params.type as unknown as ColumnType
                const autoIncrement : boolean = b.params.autoIncrement;
                const notNull : boolean = b.params.notNull;
                const defaultValue : any = b.params.defaultValue;
                const unique : boolean = b.params.unique;
                const index : boolean = b.params.index;
                const onUpdate : any = b.params.onUpdate;

                ormColumns.push({name, type, autoIncrement, notNull, defaultValue, unique, index, onUpdate})
            }

            for (const b of results) {
                const name : string = b.columnName ?? 'error';
                const type = ColumnType.getByName(b.columnType);
                if (!type) continue

                databaseColumns.push({name, type})
            }

            const thisScopes : Set<MigrationType> | undefined = System.MIGRATION_TABLES.get(i)

            if (!thisScopes) continue;

            if (thisScopes.has(MigrationType.COLUMNS)) await this.absent(ormColumns, databaseColumns, System.TABLES_NAMES.get(i) ?? 'error');

        }
    }

    private static async absent(ormColumns: (ColumnT & ORMColumn)[], databaseColumns: ColumnT[], table: string) {
        await this.absentInOrm(ormColumns, databaseColumns, table)
        const absentInDatabaseColumns = ormColumns.map(obj => obj.name).filter(obj => !((databaseColumns.map(dbobj => dbobj.name)).includes(obj)))

        if (absentInDatabaseColumns.length < 1) return;

        for (const i of absentInDatabaseColumns) {
            const column : (ColumnT & ORMColumn) | undefined = ormColumns.find(obj => obj.name == i)
            if (!column) continue;

            let columnSQL = `${column.name} ${column.type.type}`;

            if (column.autoIncrement) {
                columnSQL += " AUTO_INCREMENT PRIMARY KEY";
            }

            if (column.notNull) {
                columnSQL += " NOT NULL";
            }

            if (column.defaultValue !== null) {
                if (column.defaultValue instanceof SqlFunctions) columnSQL += ` DEFAULT ${column.defaultValue.name}`;
                else if (typeof column.defaultValue === "boolean") columnSQL += ` DEFAULT ${column.defaultValue}`
                else columnSQL += ` DEFAULT '${column.defaultValue}'`;
            }

            if (column.unique) {
                columnSQL += " UNIQUE"
            }

            if (column.index) {
                columnSQL += " INDEX"
            }

            if (column.onUpdate !== null) {
                if (column.onUpdate instanceof SqlFunctions) columnSQL += ` ON UPDATE ${column.onUpdate.name}`
                else columnSQL += ` ON UPDATE '${column.onUpdate}'`
            }

            await new DatabaseAPI().databaseSetQuery({
                sql: `ALTER TABLE ${table} ADD ${columnSQL}`,
                params: []
            })
        }

    }

    private static async absentInOrm(ormColumns: (ColumnT & ORMColumn)[], databaseColumns: ColumnT[], table: string) {
        const absentInORM = databaseColumns.map(obj => obj.name).filter(obj => !((ormColumns.map(dbobj => dbobj.name)).includes(obj)))
        if (absentInORM.length < 1) return;

        for (const i of absentInORM) {
            await new DatabaseAPI().databaseSetQuery({
                sql: `ALTER TABLE ${table} DROP COLUMN ${i}`,
                params: []
            })
        }
    }

}