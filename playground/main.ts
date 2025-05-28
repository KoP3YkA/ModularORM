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
class PlaygroundTableOne extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.FLOAT })
    public money!: number;

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
        migrations: 'auto',
        checkTablesExists: true
    })

    const oneRepository = new Repository(PlaygroundTableOne);
    await oneRepository.insert({ money: 3.3 })
    console.log(await oneRepository.find())

})
