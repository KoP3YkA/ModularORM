import {ColumnType} from "../classes/base/ColumnType";

export interface ColumnParams {

    type: ColumnType, // Type of column. Ex: TEXT, VARCHAR(255) and more
    autoIncrement: boolean // AUTO_INCREMENT PRIMARY KEY
    defaultValue: any // DEFAULT
    notNull: boolean // NOT NULL

}