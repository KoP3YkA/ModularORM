import {Module, Table, NamedTable, AutoIncrementId, Column, ColumnType, SoftDeleteColumn, Result} from '../../src'
import {QueryIs} from "../../src/classes/base/QueryIs";

@Table()
@NamedTable('logs')
export class Logs extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.TEXT })
    public content!: string;

    @SoftDeleteColumn()
    public deleted_at!: Date | QueryIs;

}