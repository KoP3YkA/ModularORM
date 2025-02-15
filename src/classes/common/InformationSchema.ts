import {Module} from "../abstract/Module";
import {Result} from "../../decorators/Result";
import {QueryResult} from "../base/QueryResult";
import {SelectQueryParams} from "../../interfaces/SelectQueryParams";
import {Nothing} from "../../types/Nothing";
import {ModelAdapter} from "../adapter/ModelAdapter";
import {DatabaseAPI} from "../base/DatabaseAPI";

export class InformationSchema extends Module {

    public static override get table() : string {
        return 'information_schema.TABLES'
    }

    public static select = async <T extends QueryResult>(where: { [key: string] : any }, params?: Partial<SelectQueryParams>) : Nothing => {
        if (where['TABLE_SCHEMA'] && where['TABLE_NAME']) {
            await new DatabaseAPI().databaseSetQuery({
                sql: `ANALYZE TABLE ${where['TABLE_SCHEMA']}.${where['TABLE_NAME']};`,
                params: []
            })
        }
        return await new ModelAdapter(InformationSchema).select(InformationSchemaResult, where, params)
    }

}

export class InformationSchemaResult {

    @Result('TABLE_CATALOG')
    public catalog : string = '';

    @Result('TABLE_SCHEMA')
    public database : string = '';

    @Result('TABLE_NAME')
    public table : string = '';

    @Result('ENGINE')
    public engine : string = '';

    @Result('VERSION')
    public version : number = 0;

    @Result('TABLE_ROWS')
    public rows : number = 0;

    @Result('AUTO_INCREMENT')
    public autoIncrement : number = 0;

    @Result('CREATE_TIME')
    public created : Date = new Date();

    @Result('UPDATE_TIME')
    public updated : Date = new Date();

    @Result('CHECK_TIME')
    public check : Date = new Date();

}