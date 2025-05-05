import {DatabaseParams} from "../../interfaces/DatabaseParams";
import {Connection, createConnection, createPool, Pool} from "mysql2/promise";
import {Nothing} from "../../types/Nothing";
import {System} from "../../namespaces/System";
import {Logger} from "../Logger";
import chalk from "chalk";

export abstract class Database {

    public static listTables : Set<string> = new Set<string>();

    protected static connection : Pool;

    protected constructor() {}

    public static async connect(params: DatabaseParams) : Nothing {
        System.DATABASE_CONNECTION_DATA = params;
        if (!this.connection) this.connection = await createPool({...params,
            keepAliveInitialDelay: 10000,
            enableKeepAlive: true
        })
    }

    public static async init() : Nothing {
        // -------- ADD OBJECTS -------

        // ----------------------------
        const regex = /CREATE TABLE IF NOT EXISTS\s+([^\s(]+)/i;
        for (const query of Database.listTables) {
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