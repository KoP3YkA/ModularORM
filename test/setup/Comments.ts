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
import {Posts} from "./Posts";

@Table()
@NamedTable('comments')
export class Comments extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.TEXT })
    public content!: string;

    @ManyToOne(() => Posts, (post) => post.comments)
    public author_id!: number;

}