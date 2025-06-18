import {QueryBuilder, QueryType, Repository, Result, SelectBuilder, ToNumber} from "../../src";
import {Users, UsersDTO} from "../setup/Users";
import {describe} from "node:test";
import {setupOrm} from "../setup.orm";

const usersRepository = new Repository(Users);

beforeAll(async () => {
    await setupOrm()
})

beforeEach(async () => {
    await usersRepository.deleteAll();
})

class CountResult {

    @Result('count')
    @ToNumber()
    public count!: number;

}

describe('Builder tests', () => {
    test('Select count', async () => {
        await usersRepository.deleteAll();

        await usersRepository.insert({ name: 'Elena', money: '30000' })
        await usersRepository.insert({ name: 'Jenny', money: '4000' })
        await usersRepository.insert({ name: 'Artur', money: '7500' })

        const builder = await new QueryBuilder()
            .setTable(Users)
            .setType(QueryType.SELECT)
            .setSelect(
                new SelectBuilder()
                    .addCount('id', 'count')
            )
            .build()
            .get(CountResult);

        expect(builder[0].count).toBe(3)
    })
})