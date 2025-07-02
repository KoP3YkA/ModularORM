import {AutoIncrementId, Column, ColumnType, Module, NamedTable, OneToMany, Result, Table, ToNumber} from '../../src'
import {Comments} from "./Comments";

@Table({ priority: 1000 })
@NamedTable('posts')
export class Posts extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(64) })
    public title!: string;

    @OneToMany(() => Comments, (comment) => comment.author_id)
    public comments!: Comments[]

}