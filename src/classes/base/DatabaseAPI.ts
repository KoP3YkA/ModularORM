import {Database} from "../abstract/Database";
import {Nothing} from "../../types/Nothing";
import {FieldPacket} from "mysql2";
import {Query} from "../../interfaces/Query";
import {Logger} from "../Logger";
import chalk from "chalk";

export class DatabaseAPI extends Database {

    public constructor() {
        super();
    }

    /**
     * Executes a query that modifies the database (e.g., INSERT, UPDATE, DELETE).
     * @param params - The parameters required for the query, including the SQL statement and the parameters for the query.
     * @returns Nothing (Promise<void>).
     */
    public async databaseSetQuery(params: Query) : Nothing {
        try {
            await DatabaseAPI.connection.query(params.sql, params.params);
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
            [rows, fields] = await DatabaseAPI.connection.query(params.sql, params.params);
        } catch (err) {
            Logger.error(chalk.red(`Error when executing GET query:\n${err}`))
            return [];
        }
        (await DatabaseAPI.connection.getConnection()).release()
        return rows as any[];
    }

}