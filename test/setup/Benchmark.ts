import {
    AutoIncrementId,
    Column,
    ColumnType,
    ManyToOne,
    Module,
    NamedTable,
    OneToMany,
    Result,
    Table,
    ToNumber
} from '../../src'

@Table()
@NamedTable("benchmark")
export class Benchmark extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(255) })
    public title!: string;

    @Column({ type: ColumnType.INTEGER })
    public views!: number;

    @Column({ type: ColumnType.BOOLEAN })
    public is_banned!: boolean;

}