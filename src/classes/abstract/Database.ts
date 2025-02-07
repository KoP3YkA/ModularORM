import {DatabaseParams} from "../../interfaces/DatabaseParams";
import {Connection, createConnection, createPool, Pool} from "mysql2/promise";
import {Nothing} from "../../types/Nothing";

export abstract class Database {

    public static listTables : Set<string> = new Set<string>();

    protected static connection : Pool;

    protected constructor() {}

    public static async connect(params: DatabaseParams) : Nothing {
        if (!this.connection) this.connection = await createPool({...params,
            keepAliveInitialDelay: 10000,
            enableKeepAlive: true
        })
    }

    public static async init() : Nothing {
        // -------- ADD OBJECTS -------

        // ----------------------------
        for (const query of Database.listTables) {
            await this.connection.query(query)
        }
    }

}