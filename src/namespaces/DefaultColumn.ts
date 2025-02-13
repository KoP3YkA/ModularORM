import {ColumnParams} from "../interfaces/ColumnParams";
import {ColumnType} from "../classes/base/ColumnType";

export namespace DefaultColumn {

    /**
    * INTEGER AUTO INCREMENT PRIMARY KEY NOT NULL
    */
    export const AUTOINCREMENT_ID : Partial<ColumnParams> = {
        type: ColumnType.INTEGER,
        autoIncrement: true,
        notNull: true
    }
    /**
     * VARCHAR(64) NOT NULL UNIQUE
     */
    export const VARCHAR_UUID : Partial<ColumnParams> = {
        type: ColumnType.VARCHAR(64),
        notNull: true,
        unique: true
    }

    /**
     * DATETIME NOT NULL
     */
    export const TIME : Partial<ColumnParams> = {
        type: ColumnType.DATETIME,
        notNull: true
    }

    /**
     * BOOLEAN NOT NULL
     */
    export const BOOLEAN : Partial<ColumnParams> = {
        type: ColumnType.BOOLEAN,
        notNull: true
    }

    /**
     * BOOLEAN NOT NULL DEFAULT(true)
     */
    export const BOOL_DEFAULT_TRUE : Partial<ColumnParams> = {
        type: ColumnType.BOOLEAN,
        notNull: true,
        defaultValue: true
    }

    /**
     * BOOLEAN NOT NULL DEFAULT(false)
     */
    export const BOOL_DEFAULT_FALSE : Partial<ColumnParams> = {
        type: ColumnType.BOOLEAN,
        notNull: true,
        defaultValue: false
    }

    /**
     * INTEGER NOT NULL
     */
    export const INTEGER : Partial<ColumnParams> = {
        type: ColumnType.INTEGER,
        notNull: true
    }

    /**
     * VARCHAR(255) NOT NULL
     */
    export const LONG_VARCHAR : Partial<ColumnParams> = {
        type: ColumnType.VARCHAR(255),
        notNull: true
    }

    /**
     * TEXT NOT NULL
     */
    export const TEXT : Partial<ColumnParams> = {
        type: ColumnType.TEXT,
        notNull: true
    }

    /**
     * JSON NOT NULL
     */
    export const JSON : Partial<ColumnParams> = {
        type: ColumnType.JSON,
        notNull: true
    }

}