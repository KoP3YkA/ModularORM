import {DatabaseParams} from "../../interfaces/DatabaseParams";
import {Connection, createConnection, createPool, Pool} from "mysql2/promise";
import {Nothing} from "../../types/Nothing";
import {System} from "../../namespaces/System";
import {Logger} from "../Logger";
import chalk from "chalk";
import {Settings} from "../base/Settings";

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

    public static async init() : Nothing {
        // -------- ADD OBJECTS -------

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

        for (const query of sortedQueries) {
            const match = query.match(regex);
            const tableName = match ? match[1] : 'UNKNOWN';
            try {
                const startTime = Date.now();
                await this.connection.query(query);
                const endTime = Date.now();
                const duration = endTime - startTime;
                Logger.info(chalk.green('Executed table ') + chalk.yellowBright(tableName) + chalk.green(' in ') + chalk.yellowBright(duration + 'ms'))
            } catch (err) {
                Logger.error(chalk.red(`Error when executing table ${tableName}. Table didnt created`))
            }
        }
    }

}