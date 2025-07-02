import 'reflect-metadata'
import {
    AutoIncrementId,
    Column,
    ColumnType,
    ModularORM,
    Module, QueryBuilder, Table, TransformFactory, ValidatorFactory,
} from "../src";
import {NamedTable} from "../src/decorators/NamedTable";
import {Repository} from "../src/classes/base/Repository";
import {ManyToMany} from "../src/decorators/ManyToMany";
import {JoinTable} from "../src/decorators/JoinTable";
import {RenamedColumn} from "../src/decorators/RenamedColumn";
import {log} from "node:util";
import {UsersDTO} from "../test/setup/Users";

@Table()
@NamedTable('playground_table_one')
class Students extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(255) })
    public user!: string;

    @ManyToMany(() => Courses, (course) => course.students)
    @JoinTable()
    public courses!: Courses[];

}

@Table()
@NamedTable('playground_table_two')
class Courses extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(255) })
    public course!: string;

    @ManyToMany(() => Students, (student) => student.courses)
    public students!: Students[];

}

new Promise(async (re, rj) => {
    const main : ModularORM = ModularORM.getInstance()
    await main.start({
        host: 'localhost',
        user: 'root',
        password: '1',
        database: 'orm',
        port: 3306,
        logs: true,
        useCache: true,
        checkTablesExists: true,
        logQueriesValues: true
    })

    const coursesRepository = new Repository(Courses);
    const studentsRepository = new Repository(Students);

    await studentsRepository.deleteAllManyToManyRelations("courses");
    await studentsRepository.deleteAll();
    await studentsRepository.find();
    await studentsRepository.find({ id: [1, 2] });

})
