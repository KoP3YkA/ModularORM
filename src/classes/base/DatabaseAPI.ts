import {Database} from "../abstract/Database";
import {Nothing} from "../../types/Nothing";
import {FieldPacket} from "mysql2";
import {Query} from "../../interfaces/Query";

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
        await DatabaseAPI.connection.query(params.sql, params.params);
        (await DatabaseAPI.connection.getConnection()).release()
    }

    /**
     * Executes a query that retrieves data from the database (e.g., SELECT).
     * @param params - The parameters required for the query, including the SQL statement and the parameters for the query.
     * @returns An array of rows returned by the query.
     */
    public async databaseGetQuery(params: Query) : Promise<any[]> {
        const [rows, fields]: [any[], FieldPacket[]] = await DatabaseAPI.connection.query(params.sql, params.params);
        (await DatabaseAPI.connection.getConnection()).release()
        return rows as any[];
    }

}