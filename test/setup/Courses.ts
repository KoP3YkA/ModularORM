import {AutoIncrementId, Column, ColumnType, ManyToMany, Module, NamedTable, Table} from '../../src'
import {Students} from "./Students";

@Table()
@NamedTable('courses')
export class Courses extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(64) })
    public title!: string;

    @ManyToMany(() => Students, (student) => student.courses)
    public students!: Students[];

}