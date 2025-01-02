import {Database} from "../abstract/Database";
import {DatabaseParams} from "../../interfaces/DatabaseParams";
import {Nothing} from "../../types/Nothing";
import {DatabaseQueryApiParams} from "../../interfaces/DatabaseQueryApiParams";
import {FieldPacket} from "mysql2";

export class DatabaseAPI extends Database {

    public constructor() {
        super();
    }

    public async databaseSetQuery(params: DatabaseQueryApiParams) : Nothing {
        await DatabaseAPI.connection.query(params.sql, params.params);
    }

    public async databaseGetQuery(params: DatabaseQueryApiParams) : Promise<any[]> {
        const [rows, fields]: [any[], FieldPacket[]] = await DatabaseAPI.connection.query(params.sql, params.params);
        return rows as any[];
    }

}