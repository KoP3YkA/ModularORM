import {ColumnParams} from "../interfaces/ColumnParams";
import {ColumnType} from "../classes/base/ColumnType";

export namespace DefaultColumn {

    export const AUTOINCREMENT_ID : Partial<ColumnParams> = {
        type: ColumnType.INTEGER,
        autoIncrement: true,
        notNull: true
    }

    export const VARCHAR_UUID : Partial<ColumnParams> = {
        type: ColumnType.VARCHAR(64),
        notNull: true,
        unique: true
    }

    export const TIME : Partial<ColumnParams> = {
        type: ColumnType.DATETIME,
        notNull: true
    }

    export const BOOL_DEFAULT_TRUE : Partial<ColumnParams> = {
        type: ColumnType.BOOLEAN,
        notNull: true,
        defaultValue: true
    }

    export const BOOL_DEFAULT_FALSE : Partial<ColumnParams> = {
        type: ColumnType.BOOLEAN,
        notNull: true,
        defaultValue: false
    }

}