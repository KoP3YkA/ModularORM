import {
    ModularORM,
    NamedTable,
    Table,
    Module,
    AutoIncrementId,
    Column,
    ColumnType,
    OneToMany,
    ManyToOne,
    Repository
} from "../src";

@Table()
@NamedTable('posts')
class Posts extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(255), notNull: true })
    public title!: string;

    @Column({ type: ColumnType.TEXT })
    public content!: string;

    @OneToMany(() => Reactions, (like) => like.postId)
    public reactions!: Reactions[];

}

@Table()
@NamedTable('reactions')
class Reactions extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(64), notNull: true, index: true })
    public userId!: string;

    @Column({ type: ColumnType.VARCHAR(32), notNull: true })
    public reactionTag!: string;

    @ManyToOne(() => Posts, (post) => post.reactions)
    public postId!: number;

}

(async () => {
    const main : ModularORM = ModularORM.getInstance()
    await main.start({
        host: 'localhost',
        user: 'root',
        password: '1',
        database: 'orm',
        port: 3306,
        connectionType: 'pool',
    })

    const postsRepository = new Repository(Posts);
    const reactionsRepository = new Repository(Reactions);

    await postsRepository.insert({ title: 'Hi!', content: 'How are u?' });
    await reactionsRepository.insert({ postId: 1, userId: '1', reactionTag: 'like' });
    await reactionsRepository.insert({ postId: 1, userId: '2', reactionTag: 'shit' });

    const results = await postsRepository.findOneByAutoincrementKey(1, { relations: [Reactions] });
    const relations = results!.reactions // length is 2

})()