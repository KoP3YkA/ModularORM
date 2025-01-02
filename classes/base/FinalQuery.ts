import {QueryBuilder} from "./QueryBuilder";
import {Nothing} from "../../types/Nothing";
import {SQLQueryBuilder} from "./SQLQueryBuilder";
import {Query} from "../../interfaces/Query";
import {ModularORM} from "../../modularorm";
import {Database} from "../abstract/Database";
import {DatabaseAPI} from "./DatabaseAPI";
import {QueryResult} from "./QueryResult";

export class FinalQuery {

    public builder : QueryBuilder;
    private sql!: string;
    private values!: any[]

    public constructor(builder: QueryBuilder) {
        this.builder = builder;
    }

    private toString() : void {
        const result : Query = new SQLQueryBuilder(this.builder).toQuery();
        this.sql = result.sql;
        this.values = result.params;
    }

    public async execute() : Nothing {
        this.toString()
        await new DatabaseAPI().databaseSetQuery({
            sql: this.sql,
            params: this.values
        })
    }

    public async get<T extends QueryResult>(ctor: { new (): T }) : Promise<T[]> {
        this.toString();
        const dbResult : any[] = await new DatabaseAPI().databaseGetQuery({
            sql: this.sql,
            params: this.values
        });
        return dbResult.map(row => {
            const resultInstance = new ctor();
            for (const property of Object.keys(resultInstance)) {
                const prototype = Object.getPrototypeOf(resultInstance);
                const columnName = Reflect.getMetadata('result-mapping', prototype, property);
                if (columnName && row.hasOwnProperty(columnName)) {
                    (resultInstance as any)[property] = row[columnName];
                }
            }
            return resultInstance;
        });
    }

}