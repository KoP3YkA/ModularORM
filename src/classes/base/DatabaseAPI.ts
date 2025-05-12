import {Database} from "../abstract/Database";
import {Nothing} from "../../types/Nothing";
import {FieldPacket, QueryResult} from "mysql2";
import {Query} from "../../interfaces/Query";
import {Logger} from "../Logger";
import chalk from "chalk";
import {Cache} from "./Cache";

export class DatabaseAPI extends Database {

    public constructor() {
        super();
    }

    private checkUseCache(cache: boolean | undefined) : boolean {
        if (typeof cache === 'undefined') return true;
        else return cache
    }

    /**
     * Executes a query that modifies the database (e.g., INSERT, UPDATE, DELETE).
     * @param params - The parameters required for the query, including the SQL statement and the parameters for the query.
     * @returns Nothing (Promise<void>).
     */
    public async databaseSetQuery(params: Query) : Nothing {
        try {
            const startTime : number = Date.now();
            const [rows, _] : [ QueryResult, FieldPacket[] ] = await DatabaseAPI.connection.query(params.sql, params.params);
            const endTime : number = Date.now();
            Cache.delCache(params.sql, params.params)
            Logger.info(chalk.green(`Executed query `) + chalk.yellowBright(params.sql) + chalk.green(` in `) + chalk.yellowBright(`${endTime - startTime}ms`) + chalk.green('. ') + chalk.yellowBright("affectedRows" in rows ? rows.affectedRows : 0) + chalk.green(' rows affected'))
        } catch (err) {
            Logger.error(chalk.red(`Error when executing SET query:\n${err}`))
        }
        (await DatabaseAPI.connection.getConnection()).release()
    }

    /**
     * Executes a query that retrieves data from the database (e.g., SELECT).
     * @param params - The parameters required for the query, including the SQL statement and the parameters for the query.
     * @returns An array of rows returned by the query.
     */
    public async databaseGetQuery(params: Query) : Promise<any[]> {
        let rows : any[] = [];
        let fields: any[] = [];
        try {
            const startTime : number = Date.now();
            const cache = Cache.getCache(params.sql, params.params);
            if (cache) {
                const endTime : number = Date.now();
                Logger.info(chalk.green('Got cache of query ') + chalk.yellowBright(params.sql) + chalk.green(` in `) + chalk.yellowBright(`${endTime-startTime}ms`))
                return cache;
            }
            [rows, fields] = await DatabaseAPI.connection.query(params.sql, params.params);
            const endTime : number = Date.now();
            Logger.info(chalk.green('Executed query ') + chalk.yellowBright(params.sql) + chalk.green(` in `) + chalk.yellowBright(`${endTime-startTime}ms`))
            if (this.checkUseCache(params.useCache)) Cache.setCache(params.sql, params.params, rows, params.cacheTTL)
        } catch (err) {
            Logger.error(chalk.red(`Error when executing GET query:\n${err}`))
            return [];
        }
        (await DatabaseAPI.connection.getConnection()).release()
        return rows as any[];
    }

}