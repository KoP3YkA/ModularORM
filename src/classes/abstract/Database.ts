import {DatabaseParams} from "../../interfaces/DatabaseParams";
import {Connection, createConnection, createPool, Pool} from "mysql2/promise";
import {Nothing} from "../../types/Nothing";
import {System} from "../../namespaces/System";
import {Logger} from "../Logger";
import chalk from "chalk";
import {Settings} from "../base/Settings";
import {SqlFunctions} from "../base/SqlFunctions";
import {TableCreateParams} from "../../interfaces/TableCreateParams";
import {Module} from "./Module";
import {Column} from "../../decorators/Column";
import {ColumnType} from "../base/ColumnType";
import {ModuleSchema} from "../adapter/ModuleSchema";
import {Relation} from "../../interfaces/Relation";
import {PropertyName} from "../adapter/GetPropertyName";
import {ModularORMException} from "../base/ModularORMException";
import {DatabaseAPI} from "../base/DatabaseAPI";

export abstract class Database {

    public static listTables : Set<string> = new Set<string>();

    protected static connection : Pool | Connection;

    protected constructor() {}

    public static async connect(params: DatabaseParams) : Nothing {
        System.DATABASE_CONNECTION_DATA = params;
        if (Settings.connectionType === 'pool') {
            if (!this.connection) this.connection = await createPool({...params,
                keepAliveInitialDelay: 10000,
                enableKeepAlive: true
            })
        } else if (Settings.connectionType === 'connection') {
            if (!this.connection) this.connection = await createConnection(params)
        }
    }

    private static async buildSchema(target: Function, params?: Partial<TableCreateParams>) {
        const columns = Reflect.getMetadata("columns", target) || [];
        const indexSQL: string[] = [];
        const foreignKeysSQL: string[] = [];

        const columnsSQL = columns.map((column: any) => {
            const { propertyKey, params } = column;
            let columnSQL = `\`${propertyKey}\` ${params.type.type}`;

            if (params.autoIncrement) {
                columnSQL += " AUTO_INCREMENT PRIMARY KEY";
            }

            if (params.notNull) {
                columnSQL += " NOT NULL";
            }

            if (params.defaultValue !== null) {
                if (params.defaultValue instanceof SqlFunctions) columnSQL += ` DEFAULT ${params.defaultValue.name}`;
                else if (typeof params.defaultValue === "boolean") columnSQL += ` DEFAULT ${params.defaultValue}`
                else columnSQL += ` DEFAULT '${params.defaultValue}'`;
            }

            if (params.unique) {
                columnSQL += " UNIQUE"
            }

            if (params.index) {
                indexSQL.push(`INDEX idx_${propertyKey} (\`${propertyKey}\`)`);
            }

            if (params.onUpdate !== null) {
                if (params.onUpdate instanceof SqlFunctions) columnSQL += ` ON UPDATE ${params.onUpdate.name}`
                else columnSQL += ` ON UPDATE '${params.onUpdate}'`
            }

            if (params.comment) {
                columnSQL += ` COMMENT '${params.comment}'`
            }

            if (params.foreignKey) {
                foreignKeysSQL.push(
                    `FOREIGN KEY (\`${propertyKey}\`) REFERENCES ${params.foreignKey.referencedTable}(${params.foreignKey.referencedColumn})` +
                    (params.onDeleteForeign ? ` ON DELETE ${params.onDeleteForeign}` : '') +
                    (params.onUpdateForeign ? ` ON UPDATE ${params.onUpdateForeign}` : '')
                );
            }

            return columnSQL;
        }).join(", ");

        const tableName = (target as any).table;

        if (String(columnsSQL).length === 0) {
            throw new ModularORMException(`${tableName} is empty!`)
        }

        const foreignKeys = foreignKeysSQL.length > 0
            ? `, ${foreignKeysSQL.join(", ")}`
            : "";
        const indexes = indexSQL.length > 0 ? `, ${indexSQL.join(", ")}` : "";

        const tableComment = params?.comment ? ` COMMENT='${params.comment}'` : '';
        const tableCollation = params?.collation ? ` COLLATE=${params.collation}` : '';
        const tableFormat = params?.rowFormat ? ` ROW_FORMAT=${params.rowFormat}` : '';

        if (params?.migrations && params.migrations) System.MIGRATION_TABLES.add(target)

        const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSQL}${indexes}${foreignKeys})${tableCollation}${tableFormat}${tableComment};`;
        System.TABLES_NAMES.set(target, tableName)
        System.TABLES_PRIORITY.set(tableName, params?.priority ?? 0)
        System.TABLES_SETTINGS.set(tableName, {
            priority: params?.priority ?? 0,
            comment: params?.comment ?? '',
            collation: params?.collation ?? 'currency',
            rowFormat: params?.rowFormat ?? 'Dynamic',
            migrations: params?.migrations ?? false
        })

        Database.listTables.add(createTableSQL);
    }

    private static async initJoinTables() : Nothing {
        for (const i of System.JOIN_TABLES) {
            const result : Relation | undefined = Array.from(System.MANY_TO_MANY).find(obj => obj.propertyKey === i.propertyKey);
            if (!result) throw new ModularORMException('Join table cannot be created without ManyToMany relations.')
            const inverseResult = Array.from(System.MANY_TO_MANY).find(obj => obj.propertyKey === PropertyName.getPropertyName(result.column));
            if (!inverseResult) throw new ModularORMException('ManyToMany relations can\'t be one-sided.')
            const resultTableName : string = new ModuleSchema(result.target as any).getName()
            const inverseResultTableName : string = new ModuleSchema(inverseResult.target as any).getName()
            const tableName : string = i.name ?? `${resultTableName}_${inverseResultTableName}`

            const resultPrimaryKey = new ModuleSchema(result.target as any).getAutoincrementKey();
            const inverseResultPrimaryKey = new ModuleSchema(inverseResult.target as any).getAutoincrementKey();
            if (!resultPrimaryKey || !inverseResultPrimaryKey) throw new ModularORMException('Tables must have primary keys');
            const onDelete : string = i.onDelete ? ` ON DELETE ${i.onDelete}` : ``;

            await this.connection.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${result.propertyKey} INTEGER NOT NULL, ${inverseResult.propertyKey} INTEGER NOT NULL, INDEX idx_${result.propertyKey} (${result.propertyKey}), INDEX idx_${inverseResult.propertyKey} (${inverseResult.propertyKey}), FOREIGN KEY (${result.propertyKey}) REFERENCES ${inverseResultTableName}(${inverseResultPrimaryKey})${onDelete}, FOREIGN KEY (${inverseResult.propertyKey}) REFERENCES ${resultTableName}(${resultPrimaryKey})${onDelete})`)
        }
    }

    public static async init() : Nothing {
        for (const i of System.MANY_TO_ONE) {
            const columns = Reflect.getMetadata("columns", i.target) || [];
            let primaryKey : string | undefined = (columns as any[]).find(obj => obj.params.autoIncrement === true)?.propertyKey;
            if (!primaryKey) throw new ModularORMException('Primary key is not defined!')
            const tableName = new ModuleSchema(i.table() as any).getName()
            Column({ type: ColumnType.INTEGER, foreignKey: { referencedTable: tableName, referencedColumn: primaryKey } })(i.target.prototype, i.propertyKey)
        }

        for (const i of System.BUILD_SCHEMA) {
            await this.buildSchema(i[0], i[1])
        }

        // ----------------------------
        const regex = /CREATE TABLE IF NOT EXISTS\s+([^\s(]+)/i;

        const sortedQueries = [...Database.listTables].sort((a, b) => {
            const tableA = a.match(regex);
            const tableB = b.match(regex);

            const tableNameA = tableA ? tableA[1] : 'UNKNOWN';
            const tableNameB = tableB ? tableB[1] : 'UNKNOWN';

            const priorityA = System.TABLES_PRIORITY.get(tableNameA) || 0;
            const priorityB = System.TABLES_PRIORITY.get(tableNameB) || 0;

            return priorityB - priorityA;
        });

        let existsTables : string[] | null = null;
        if (Settings.checkTablesExists) {
            const [rows, fields] = await this.connection.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${Settings.databaseName}'`)
            existsTables = (rows as any[]).map((row: any) => row.TABLE_NAME);
        }

        for (const query of sortedQueries) {
            const match = query.match(regex);
            const tableName = match ? match[1] : 'UNKNOWN';

            if (existsTables && existsTables.includes(tableName)) continue

            try {
                const startTime = Date.now();
                await this.connection.query(query);
                const endTime = Date.now();
                const duration = endTime - startTime;
                Logger.info(chalk.green('Executed table ') + chalk.yellowBright(tableName) + chalk.green(' in ') + chalk.yellowBright(duration + 'ms'))
            } catch (err) {
                throw new ModularORMException(`Error when executing table ${tableName}. Table didnt created:\n${err}`)
            }
        }

        await this.initJoinTables();
    }

}