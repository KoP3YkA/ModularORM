import {Module} from "../abstract/Module";
import {SelectQueryParams} from "../../interfaces/SelectQueryParams";
import {Nothing} from "../../types/Nothing";
import {DatabaseAPI} from "../base/DatabaseAPI";
import {ModelAdapter} from "../adapter/ModelAdapter";
import {Result} from "../../decorators/Result";
import {IsNumber, IsString, IsUUID} from "../../decorators/validators/Validators";

export class InformationSchemaColumns extends Module {

    public static override get table() : string {
        return 'information_schema.COLUMNS'
    }

    public static select = async (where: { [key: string] : any }, params?: Partial<SelectQueryParams<InformationSchemaColumns>>) : Nothing => {
        if (where['TABLE_SCHEMA'] && where['TABLE_NAME']) {
            await new DatabaseAPI().databaseSetQuery({
                sql: `ANALYZE TABLE ${where['TABLE_SCHEMA']}.${where['TABLE_NAME']};`,
                params: []
            })
        }
        return await new ModelAdapter(InformationSchemaColumns).select(InformationSchemaColumnsResult, where, params)
    }

}

export class InformationSchemaColumnsResult {

    @Result('TABLE_CATALOG')
    public tableCatalog : string = "";

    @Result('TABLE_SCHEMA')
    public tableSchema : string = "";

    @Result('TABLE_NAME')
    public tableName : string = "";

    @Result('COLUMN_NAME')
    public columnName : string = "";

    @Result("ORDINAL_POSITION")
    public ordinalPosition : number = 0;

    @Result('COLUMN_DEFAULT')
    public columnDefault : string = "";

    @Result('COLUMN_COMMENT')
    public columnComment : string = "";

    @Result('COLUMN_TYPE')
    public columnType : string = "";

    @Result('NUMERIC_SCALE')
    public numericScale : number = 1;

    @Result('EXTRA')
    public extra!: any;

    @Result('IS_NULLABLE')
    public isNullable!: string;

}