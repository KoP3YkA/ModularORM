import {AutoIncrementId, Column, ColumnType, Module, NamedTable, Result, Table, ToNumber, Validate} from "../../src";

@Table()
@NamedTable('users')
export class Users extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(255) })
    public name!: string;

    @Column({ type: ColumnType.VARCHAR(64) })
    public money!: string;

}

export class UsersDTO {

    @Result('id')
    public userId!: number;

    @Result('name')
    public userName!: string;

    @Result()
    @ToNumber()
    public money!: number;

}