import {AutoIncrementId, Column, ColumnType, JoinTable, ManyToMany, Module, NamedTable, Table} from '../../src'
import {Courses} from "./Courses";

@Table()
@NamedTable('students')
export class Students extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(64) })
    public name!: string;

    @ManyToMany(() => Courses, (course) => course.students)
    @JoinTable()
    public courses!: Courses[]

}