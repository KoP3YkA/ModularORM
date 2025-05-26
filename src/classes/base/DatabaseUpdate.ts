import 'reflect-metadata'
import {Nothing} from "../../types/Nothing";
import {System} from "../../namespaces/System";
import {InformationSchemaColumns, InformationSchemaColumnsResult} from "../common/InformationSchemaColumns";
import {ColumnType} from "./ColumnType";
import {DatabaseParams} from "../../interfaces/DatabaseParams";
import {DatabaseAPI} from "./DatabaseAPI";
import {SqlFunctions} from "./SqlFunctions";
import {Logger} from "../Logger";
import chalk from "chalk";
import {Settings} from "./Settings";
import fs from 'fs/promises';
import * as path from "node:path";
import {QueryIs} from "./QueryIs";
import {ModuleSchema} from "../adapter/ModuleSchema";
import {IJoinTable} from "../../interfaces/JoinTableInterface";
import {Module} from "../abstract/Module";
import {Relation} from "../../interfaces/Relation";
import {ModularORMException} from "./ModularORMException";


type ColumnT = {
    name: string,
    type: ColumnType,
    defaultValue: any,
    comment: any,
    extra: any,
    isNullable: string;
};

type ORMColumn = {
    autoIncrement: boolean,
    defaultValue: any,
    notNull: boolean,
    unique: boolean,
    index: boolean,
    onUpdate: any,
    foreignKey: { referencedTable: string, referencedColumn: string },
    onDeleteForeign: "CASCADE" | "SET NULL" | "RESTRICT",
    onUpdateForeign: "CASCADE" | "SET NULL" | "RESTRICT"
};

export class DatabaseUpdate {

    private static migrations: Set<string> = new Set();
    private static downMigrations: Set<string> = new Set();
    private static migrationFile: string = path.resolve(process.cwd(), `ModularORM_migration.txt`)
    private static downMigrationFile: string = path.resolve(process.cwd(), `ModularORM_down_migration.txt`)

    private static async checkFileExists(path: string) : Promise<boolean> {
        try {
            await fs.access(path, fs.constants.R_OK)
            return true
        } catch (err) {
            return (err as NodeJS.ErrnoException).code !== "ENOENT";
        }
    }

    public static async updateTables() : Nothing {
        if (Settings.migrations === 'file' && await this.checkFileExists(this.migrationFile)) {
            Logger.info('Migrating from file...')
            try {
                const data = await fs.readFile(this.migrationFile, 'utf-8');
                let successQueries : number = 0;
                let failedQueries : number = 0;
                for (const i of data.split('\n')) {
                    const res = await new DatabaseAPI().databaseSetQuery({
                        sql: i,
                        params: []
                    })
                    if (res === null) failedQueries++;
                    else successQueries++;
                }
                Logger.info(chalk.green('Migration from file successful completed. ') + chalk.yellowBright(successQueries) + chalk.green(` queries passed, `) + chalk.yellowBright(failedQueries) + chalk.green(` queries failed.`))
                return
            } catch (err) {
                throw new ModularORMException('Failed to migrate from file, try another method')
            } finally {
                await fs.rm(this.migrationFile).catch(() => {})
            }
        }

        for (const i of System.TABLES_NAMES.keys()) {
            if (!System.MIGRATION_TABLES.has(i)) continue;

            await this.handleJoinTableAndManyToMany(i, new ModuleSchema(i).getName());

            const columns = Reflect.getMetadata("columns", i) || []

            const results : InformationSchemaColumnsResult[] = await InformationSchemaColumns.select({
                TABLE_SCHEMA: (System.DATABASE_CONNECTION_DATA as DatabaseParams).database,
                TABLE_NAME: System.TABLES_NAMES.get(i) ?? 'error'
            })

            const tableRes : any[] = await new DatabaseAPI().databaseGetQuery({
                sql: `SELECT TABLE_NAME, TABLE_COLLATION, TABLE_COMMENT, ROW_FORMAT FROM information_schema.tables WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${System.TABLES_NAMES.get(i) ?? 'error'}'`,
                params: []
            })

            const tableSettingsInOrm = System.TABLES_SETTINGS.get(System.TABLES_NAMES.get(i) ?? 'error');
            if (tableRes.length !== 0 && tableSettingsInOrm) {
                const { collation, comment, rowFormat } = tableSettingsInOrm;
                await this.updateDatabase({ table: tableRes[0].TABLE_NAME, collation, comment, row_format: rowFormat }, { table: tableRes[0].TABLE_NAME, collation: tableRes[0].TABLE_COLLATION, comment: tableRes[0].TABLE_COMMENT, row_format: tableRes[0].ROW_FORMAT })
            }

            if (results.length === 0) {
                throw new ModularORMException(`Cannot create migration for ${System.TABLES_NAMES.get(i)}: 0 columns in information schema`)
            }

            const databaseColumns : ColumnT[] = [];
            const ormColumns : (ColumnT & ORMColumn)[] = [];
            const indexes: Set<string> = new Set();
            const uniqueConstraints: Set<string> = new Set();
            const foreignKeys: Map<string, { table: string, column: string, constraintName: string, onDelete: any, onUpdate: any }> = new Map();

            const indexResults = await new DatabaseAPI().databaseGetQuery({
                sql: `SHOW INDEX FROM ${System.TABLES_NAMES.get(i) ?? 'error'}`,
                params: []
            });

            let primary : string = "";

            for (const index of indexResults) {
                if (index.Key_name === 'PRIMARY') {
                    primary = index.Column_name;
                }
                if (!index.Non_unique) uniqueConstraints.add(index.Key_name);
                else indexes.add(index.Key_name);
            }

            const fkResults = await new DatabaseAPI().databaseGetQuery({
                sql: `SELECT kcu.CONSTRAINT_NAME, kcu.COLUMN_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME, rc.UPDATE_RULE, rc.DELETE_RULE FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME WHERE kcu.TABLE_NAME = '${System.TABLES_NAMES.get(i) ?? 'error'}' AND kcu.REFERENCED_TABLE_NAME IS NOT NULL`,
                params: []
            });

            for (const fk of fkResults) {
                foreignKeys.set(fk.COLUMN_NAME, {
                    table: fk.REFERENCED_TABLE_NAME,
                    column: fk.REFERENCED_COLUMN_NAME,
                    constraintName: fk.CONSTRAINT_NAME,
                    onUpdate: fk.UPDATE_RULE,
                    onDelete: fk.DELETE_RULE
                });
            }

            for (const b of columns) {
                const name : string = b.propertyKey as unknown as string;
                const type : ColumnType = b.params.type as unknown as ColumnType
                const autoIncrement : boolean = b.params.autoIncrement;
                const notNull : boolean = b.params.notNull;
                const defaultValue : any = b.params.defaultValue;
                const unique : boolean = b.params.unique;
                const index : boolean = b.params.index;
                const onUpdate : any = b.params.onUpdate;
                const foreignKey: { referencedTable: string, referencedColumn: string } = b.params.foreignKey;
                const onDeleteForeign: "CASCADE" | "SET NULL" | "RESTRICT" = b.params.onDeleteForeign;
                const onUpdateForeign: "CASCADE" | "SET NULL" | "RESTRICT" = b.params.onUpdateForeign;
                const comment: string = b.params.comment;
                const extra : string = autoIncrement ? 'AUTO_INCREMENT' : ''
                const isNullable : string = b.params.isNullable ?? 'YES';

                ormColumns.push({name, type, autoIncrement, notNull, defaultValue, unique, index, onUpdate, foreignKey, onDeleteForeign, onUpdateForeign, comment, extra ,isNullable })
            }

            for (const b of results) {
                const name : string = b.columnName ?? 'error';
                const type = ColumnType.getByName(b.columnType);
                if (!type) continue
                const defaultValue : string = b.columnDefault;

                databaseColumns.push({name, type, defaultValue, comment: b.columnComment ?? '', extra: b.extra, isNullable: b.isNullable })
            }

            const table : string | undefined = System.TABLES_NAMES.get(i)
            if (table) {
                await this.absent(ormColumns, databaseColumns, table);
                await this.editInDatabase(ormColumns, databaseColumns, table, { foreignKeys, uniqueConstraints, indexes }, primary)
            }

        }

        if (Settings.migrations === 'auto' && this.migrations.size !== 0) {
            Logger.info(chalk.green('Migrating...'))
            let successQueries : number = 0;
            let failedQueries : number = 0;
            for (const i of this.migrations) {
                const res = await new DatabaseAPI().databaseSetQuery({
                    sql: i,
                    params: []
                })
                if (res === null) failedQueries++;
                else successQueries++;
            }
            Logger.info(chalk.green('Migration successful completed. ') + chalk.yellowBright(successQueries) + chalk.green(` queries passed, `) + chalk.yellowBright(failedQueries) + chalk.green(` queries failed.`))
        } else if (Settings.migrations === 'file' && this.migrations.size !== 0) {
            try {
                await fs.writeFile(this.migrationFile, Array.from(this.migrations).join('\n'))
                Logger.info(`Migrations wrote to ModularORM_migration.txt. To apply them, restart your application again.`)
            } catch (err) {
                throw new ModularORMException(`Migrations were not created due to a file write error. Try selecting a different type.`)
            }
        }

        if (this.downMigrations.size !== 0) {
            try {
                await fs.writeFile(this.downMigrationFile, Array.from(this.downMigrations).join('\n'))
                Logger.info(`Down-migrations wrote to ModularORM_down_migration.txt. To run them, rename the file to "ModularORM_migration.txt" and restart the application. IMPORTANT: Down migrations are not removed when the application is restarted until they are run. Before running migrations again, be sure to delete this file.`)
            } catch (err) {
                Logger.error(`IMPORTANT: Down migrations were not written to the file. All requests will be sent to the console below, be sure to save them`)
                for (const i of this.downMigrations) {
                    Logger.error(i)
                }
            }
        }

    }

    private static async updateDatabase(ormParams: { table: string, collation: string, comment: string, row_format: string }, databaseParams: { table: string, collation: string, comment: string, row_format: string }) {
        if (ormParams.comment !== databaseParams.comment) {
            await this.query(`ALTER TABLE ${ormParams.table} COMMENT = '${ormParams.comment}'`);
            await this.downQuery(`ALTER TABLE ${ormParams.table} COMMENT = '${databaseParams.comment}'`)
        }

        if (ormParams.row_format !== databaseParams.row_format) {
            await this.query(`ALTER TABLE ${ormParams.table} ROW_FORMAT = ${ormParams.row_format}`);
            await this.query(`ALTER TABLE ${ormParams.table} ROW_FORMAT = ${databaseParams.row_format}`);
        }

        const charSetMap: { [key: string]: string } = {
            "utf8_general_ci": "utf8",
            "utf8_unicode_ci": "utf8",
            "utf8mb4_general_ci": "utf8mb4",
            "utf8mb4_unicode_ci": "utf8mb4",
            "utf8mb4_0900_ai_ci": "utf8mb4",
            "latin1_swedish_ci": "latin1",
            "ascii_general_ci": "ascii",
            "ucs2_general_ci": "ucs2",
            "utf16_general_ci": "utf16",
            "utf32_general_ci": "utf32",
            "cp1251_general_ci": "cp1251",
            "cp1256_general_ci": "cp1256",
            "binary": "binary"
        };

        if (ormParams.collation !== databaseParams.collation && ormParams.collation !== 'currency') {
            await this.query(`ALTER TABLE ${ormParams.table} CONVERT TO CHARACTER SET ${charSetMap[ormParams.collation] ?? 'utf8mb4'} COLLATE ${ormParams.collation}`);
            await this.query(`ALTER TABLE ${ormParams.table} CONVERT TO CHARACTER SET ${charSetMap[databaseParams.collation] ?? 'utf8mb4'} COLLATE ${databaseParams.collation}`);
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

            if (column.onUpdate !== null) {
                if (column.onUpdate instanceof SqlFunctions) columnSQL += ` ON UPDATE ${column.onUpdate.name}`
                else columnSQL += ` ON UPDATE '${column.onUpdate}'`
            }

            if (column.comment) {
                columnSQL += ` COMMENT '${column.comment}'`
            }

            let isRenamed : string | undefined = undefined;
            for (const b of System.RENAMED_COLUMN) {
                if (b.propertyKey === column.name) isRenamed = b.oldName;
            }

            if (isRenamed) {
                await this.query(`ALTER TABLE ${table} CHANGE ${isRenamed} ${columnSQL}`)
                await this.downQuery(`ALTER TABLE ${table} CHANGE ${column.name} ${isRenamed} ${columnSQL.split(' ').slice(1).join(' ')}`)
                continue;
            }

            await this.query(`ALTER TABLE ${table} ADD ${columnSQL}`)
            await this.downQuery(`ALTER TABLE ${table} DROP COLUMN ${column.name}`)
            if (column.index) {
                await this.query(`CREATE INDEX idx_${column.name} ON ${table}(${column.name})`)
            }
            if (column.foreignKey) {
                await this.query(`ALTER TABLE ${table} ADD FOREIGN KEY (\`${column.name}\`) REFERENCES ${column.foreignKey.referencedTable}(${column.foreignKey.referencedColumn}) ${column.onDeleteForeign ? `ON DELETE ${column.onDeleteForeign}` : ""} ${column.onUpdateForeign ? `ON UPDATE ${column.onUpdateForeign}` : ""}`);
            }
            if (column.unique) {
                await this.query(`ALTER TABLE ${table} ADD UNIQUE idx_${column.name} (${column.name})`);
            }

        }

    }

    private static async query(sql: string) {
        this.migrations.add(sql);
    }

    private static async downQuery(sql: string) {
        this.downMigrations.add(sql);
    }

    private static async absentInOrm(ormColumns: (ColumnT & ORMColumn)[], databaseColumns: ColumnT[], table: string) {
        const absentInORM = databaseColumns.map(obj => obj.name).filter(obj => !((ormColumns.map(dbobj => dbobj.name)).includes(obj)))
        if (absentInORM.length < 1) return;

        for (const i of absentInORM) {
            let isRenamed : boolean = false;
            for (const b of System.RENAMED_COLUMN) {
                if (b.oldName === i) isRenamed = true;
            }
            if (isRenamed) continue
            await this.query(`ALTER TABLE ${table} DROP COLUMN ${i}`)
            const column : (ColumnT & ORMColumn) | undefined = ormColumns.find(obj => obj.name == i)
            if (!column) continue;

            let columnSQL = `${column.name} ${column.type.type}`;

            if (column.autoIncrement) columnSQL += " AUTO_INCREMENT PRIMARY KEY";
            if (column.notNull) columnSQL += " NOT NULL";

            if (column.defaultValue !== null) {
                if (column.defaultValue instanceof SqlFunctions) columnSQL += ` DEFAULT ${column.defaultValue.name}`;
                else if (typeof column.defaultValue === "boolean") columnSQL += ` DEFAULT ${column.defaultValue}`
                else columnSQL += ` DEFAULT '${column.defaultValue}'`;
            }

            if (column.onUpdate !== null) {
                if (column.onUpdate instanceof SqlFunctions) columnSQL += ` ON UPDATE ${column.onUpdate.name}`
                else columnSQL += ` ON UPDATE '${column.onUpdate}'`
            }

            if (column.comment) columnSQL += ` COMMENT '${column.comment}'`

            await this.downQuery(`ALTER TABLE ${table} ADD ${columnSQL}`)
            if (column.index) await this.downQuery(`CREATE INDEX idx_${column.name} ON ${table}(${column.name})`)
            if (column.foreignKey) await this.downQuery(`ALTER TABLE ${table} ADD FOREIGN KEY (\`${column.name}\`) REFERENCES ${column.foreignKey.referencedTable}(${column.foreignKey.referencedColumn}) ${column.onDeleteForeign ? `ON DELETE ${column.onDeleteForeign}` : ""} ${column.onUpdateForeign ? `ON UPDATE ${column.onUpdateForeign}` : ""}`);
            if (column.unique) await this.downQuery(`ALTER TABLE ${table} ADD UNIQUE idx_${column.name} (${column.name})`);
        }
    }

    private static async handleJoinTableAndManyToMany(module: Module, tableName: string) {
        const schema : ModuleSchema = new ModuleSchema(module as any);
        const manyToManyRelations : Relation[] = schema.getManyToManyRelations();
        for (const i of manyToManyRelations) {
            let joinTable : { table: string, joinColumn: string, inverseJoinColumn: string, isCurrentIsJoin: boolean }
            try {
                joinTable = schema.getJoinTableName(i);
            } catch (err) {
                throw new ModularORMException('An error occurred while processing ManyToMany relationships and JOIN tables. ModularORM does not store screenshots of tables in the database, so it is not possible to restore the context. Please delete the JOIN table manually.')
            }
            const results : InformationSchemaColumnsResult[] = await InformationSchemaColumns.select({
                TABLE_SCHEMA: (System.DATABASE_CONNECTION_DATA as DatabaseParams).database,
                TABLE_NAME: joinTable.table
            })
            if (results.length !== 2) throw new ModularORMException(`An error occurred while processing the JOIN table. Please check ${joinTable.table} manually: it should have 2 columns`)
            if (results[0].columnName !== joinTable.joinColumn) {
                await this.query(`ALTER TABLE ${joinTable.table} CHANGE ${results[0].columnName} ${joinTable.joinColumn} INTEGER`)
                await this.downQuery(`ALTER TABLE ${joinTable.table} CHANGE ${joinTable.joinColumn} ${results[0].columnName} INTEGER`)
            }
            if (results[1].columnName !== joinTable.inverseJoinColumn) {
                await this.query(`ALTER TABLE ${joinTable.table} CHANGE ${results[1].columnName} ${joinTable.inverseJoinColumn} INTEGER`)
                await this.downQuery(`ALTER TABLE ${joinTable.table} CHANGE ${joinTable.inverseJoinColumn} ${results[1].columnName} INTEGER`)
            }
        }

    }

    private static async editInDatabase(
        ormColumns: (ColumnT & ORMColumn)[],
        databaseColumns: ColumnT[],
        table: string,
        dbConstraints: { indexes: Set<string>, uniqueConstraints: Set<string>, foreignKeys: Map<string, { table: string, column: string, constraintName: string, onDelete: any, onUpdate: any }> },
        primaryKey: string
    ) {
        for (const ormColumn of ormColumns) {
            const dbColumn = databaseColumns.find(dbCol => dbCol.name === ormColumn.name);
            if (!dbColumn) continue;

            let isChanged : boolean = false;
            let additionalSqls : Map<string, 'before' | 'after'> = new Map();
            let downAdditionalSqls : Map<string, 'before' | 'after'> = new Map();

            let autoIncrement : string = ormColumn.autoIncrement ? 'AUTO_INCREMENT' : '';
            let type : string = ormColumn.type.type;
            let comment : string = ormColumn.comment ? `COMMENT '${ormColumn.comment}'` : `COMMENT ''`;
            let nullable : string = ormColumn.notNull ? 'NOT NULL' : 'NULL';

            let defaultValue: string = "";
            if (ormColumn.autoIncrement) {
                defaultValue = "";
            } else if (ormColumn.defaultValue instanceof SqlFunctions) {
                defaultValue = `DEFAULT ${ormColumn.defaultValue.name}`;
            } else if (ormColumn.defaultValue instanceof QueryIs) {
                defaultValue = `DEFAULT ${ormColumn.defaultValue.tag}`
            } else if (typeof ormColumn.defaultValue === 'boolean') {
                defaultValue = ormColumn.defaultValue ? `DEFAULT true` : `DEFAULT false`;
            } else if (ormColumn.defaultValue === null) {
                defaultValue = "";
            } else if (typeof ormColumn.defaultValue !== 'undefined') {
                defaultValue = `DEFAULT '${ormColumn.defaultValue}'`;
            }

            if (ormColumn.autoIncrement && primaryKey !== ormColumn.name) {
                if (primaryKey !== '') additionalSqls.set(`ALTER TABLE ${table} DROP PRIMARY KEY`, 'before');
                autoIncrement = 'AUTO_INCREMENT'
                downAdditionalSqls.set(`ALTER TABLE ${table} DROP PRIMARY KEY`, 'after');
                additionalSqls.set(`ALTER TABLE ${table} ADD PRIMARY KEY (${ormColumn.name})`, 'after');
                isChanged = true;
            } else if (!ormColumn.autoIncrement && primaryKey === ormColumn.name) {
                additionalSqls.set(`ALTER TABLE ${table} DROP PRIMARY KEY`, 'before')
                downAdditionalSqls.set(`ALTER TABLE ${table} ADD PRIMARY KEY (${ormColumn.name})`, 'after');
                autoIncrement = '';
                isChanged = true;
            }

            if (ormColumn.type.type !== dbColumn.type.type) {
                isChanged = true;
            }

            if ((!ormColumn.notNull && dbColumn.isNullable === 'NO') || (ormColumn.notNull && dbColumn.isNullable === "YES")) {
                if (!ormColumn.autoIncrement) isChanged = true;
            }

            if (dbColumn.comment !== String(ormColumn.comment) && ormColumn.comment !== false) {
                isChanged = true;
            }

            if (ormColumn.comment === false && dbColumn.comment !== '') {
                isChanged = true;
            }

            let thisDefaultValue: string = "";
            if (ormColumn.defaultValue instanceof SqlFunctions) thisDefaultValue = ormColumn.defaultValue.name;
            else if (typeof ormColumn.defaultValue === 'boolean') ormColumn.defaultValue ? thisDefaultValue = "1" : thisDefaultValue = "0"
            else thisDefaultValue = String(ormColumn.defaultValue);

            if (thisDefaultValue !== String(dbColumn.defaultValue)) {
                if ((thisDefaultValue === 'null' || thisDefaultValue === null) && String(dbColumn.defaultValue) !== "") {
                    additionalSqls.set(`ALTER TABLE ${table} ALTER COLUMN ${ormColumn.name} DROP DEFAULT`, 'before');
                    downAdditionalSqls.set(`ALTER TABLE ${table} ALTER COLUMN ${ormColumn.name} SET DEFAULT '${dbColumn.defaultValue}'`, 'after');
                } else {
                    isChanged = true
                }
            }

            if (ormColumn.index && !dbConstraints.indexes.has(`idx_${ormColumn.name}`)) {
                additionalSqls.set(`CREATE INDEX idx_${ormColumn.name} ON ${table}(${ormColumn.name})`, 'before');
                downAdditionalSqls.set(`ALTER TABLE ${table} DROP INDEX idx_${ormColumn.name}`, 'before');
            }

            if (!ormColumn.index && dbConstraints.indexes.has(`idx_${ormColumn.name}`)) {
                additionalSqls.set(`ALTER TABLE ${table} DROP INDEX idx_${ormColumn.name}`, 'before');
                downAdditionalSqls.set(`CREATE INDEX idx_${ormColumn.name} ON ${table}(${ormColumn.name})`, 'before');
            }

            if (ormColumn.unique && !dbConstraints.uniqueConstraints.has(`unique_${ormColumn.name}`)) {
                additionalSqls.set(`ALTER TABLE ${table} ADD UNIQUE unique_${ormColumn.name} (${ormColumn.name})`, 'before');
                downAdditionalSqls.set(`ALTER TABLE ${table} DROP INDEX unique_${ormColumn.name}`, 'before');
            }

            if (!ormColumn.unique && dbConstraints.uniqueConstraints.has(`unique_${ormColumn.name}`)) {
                additionalSqls.set(`ALTER TABLE ${table} DROP INDEX unique_${ormColumn.name}`, 'before');
                downAdditionalSqls.set(`ALTER TABLE ${table} ADD UNIQUE unique_${ormColumn.name} (${ormColumn.name})`, 'before');
            }

            const fkInDB = dbConstraints.foreignKeys.get(ormColumn.name);

            if (!ormColumn.foreignKey && fkInDB) {
                additionalSqls.set(`ALTER TABLE ${table} DROP FOREIGN KEY ${fkInDB.constraintName}`, 'before');
                additionalSqls.set(`ALTER TABLE ${table} ADD CONSTRAINT ${fkInDB.constraintName} FOREIGN KEY (${ormColumn.name}) REFERENCES ${fkInDB.table}(${fkInDB.column}) ${fkInDB.onDelete? `ON DELETE ${fkInDB.onDelete}` : ""} ${fkInDB.onUpdate ? `ON UPDATE ${fkInDB.onUpdate}` : ""}`, 'before');
            }

            if (fkInDB && ormColumn.foreignKey) {
                const onDeleteChanged = fkInDB.onDelete !== ormColumn.onDeleteForeign;
                const onUpdateChanged = fkInDB.onUpdate !== ormColumn.onUpdateForeign;

                if (onDeleteChanged || onUpdateChanged ||
                    fkInDB.table !== ormColumn.foreignKey.referencedTable ||
                    fkInDB.column !== ormColumn.foreignKey.referencedColumn) {

                    additionalSqls.set(`ALTER TABLE ${table} DROP FOREIGN KEY ${fkInDB.constraintName}`, 'before');

                    const fkName = `fk_${table}_${ormColumn.name}`;
                    additionalSqls.set(`ALTER TABLE ${table} ADD CONSTRAINT ${fkName} FOREIGN KEY (${ormColumn.name}) REFERENCES ${ormColumn.foreignKey.referencedTable}(${ormColumn.foreignKey.referencedColumn}) ${ormColumn.onDeleteForeign ? `ON DELETE ${ormColumn.onDeleteForeign}` : ""} ${ormColumn.onUpdateForeign ? `ON UPDATE ${ormColumn.onUpdateForeign}` : ""}`, 'before');
                    downAdditionalSqls.set(`ALTER TABLE ${table} DROP FOREIGN KEY ${fkName}`, 'before');
                }
            } else if (ormColumn.foreignKey) {
                const fkName = `fk_${table}_${ormColumn.name}`;
                additionalSqls.set(`ALTER TABLE ${table} ADD CONSTRAINT ${fkName} FOREIGN KEY (${ormColumn.name}) REFERENCES ${ormColumn.foreignKey.referencedTable}(${ormColumn.foreignKey.referencedColumn}) ${ormColumn.onDeleteForeign ? `ON DELETE ${ormColumn.onDeleteForeign}` : ""} ${ormColumn.onUpdateForeign ? `ON UPDATE ${ormColumn.onUpdateForeign}` : ""}`, 'before');
                downAdditionalSqls.set(`ALTER TABLE ${table} DROP FOREIGN KEY ${fkName}`, 'before');
            }

            for (const i of additionalSqls) {
                if (i[1] === 'before') await this.query(i[0])
            }

            for (const i of downAdditionalSqls) {
                if (i[1] === 'before') await this.downQuery(i[0])
            }

            if (isChanged) {
                const oldType = dbColumn.type.type;
                const oldNullable = dbColumn.isNullable === 'NO' ? 'NOT NULL' : 'NULL';
                const oldComment = dbColumn.comment ? `COMMENT '${dbColumn.comment}'` : `COMMENT ''`;

                let oldDefault = '';
                if (typeof dbColumn.defaultValue !== 'undefined' && dbColumn.defaultValue !== null && dbColumn.defaultValue !== '') {
                    oldDefault = `DEFAULT '${dbColumn.defaultValue}'`;
                }

                const oldAutoIncrement = dbColumn.extra?.includes('auto_increment') ? 'AUTO_INCREMENT' : '';

                const reverseAlter = `ALTER TABLE ${table} MODIFY COLUMN ${ormColumn.name} ${oldType} ${oldNullable} ${oldDefault} ${oldAutoIncrement} ${oldComment}`;

                await this.query(`ALTER TABLE ${table} MODIFY COLUMN ${ormColumn.name} ${type} ${nullable} ${defaultValue} ${autoIncrement} ${comment}`);
                await this.downQuery(reverseAlter);
            }

            for (const i of additionalSqls) {
                if (i[1] === 'after') await this.query(i[0])
            }

            for (const i of downAdditionalSqls) {
                if (i[1] === 'after') await this.query(i[0])
            }

        }
    }

}