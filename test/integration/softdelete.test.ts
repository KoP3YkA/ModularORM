import {Repository} from "../../src";
import {Logs} from "../setup/Logs";
import {QueryIs} from "../../src/classes/base/QueryIs";
import {setupOrm} from "../setup.orm";

const logsRepository = new Repository(Logs);

beforeAll(async () => {
    await setupOrm()
})

beforeEach(async () => {
    await logsRepository.deleteAll();
})

const addLog = async () => {
    await logsRepository.insert({ content: 'SomeNickName joined the game' })
}

describe('SoftDelete tests', () => {
    test('Insert queries and select with QueryIs', async () => {
        await addLog();

        const results = await logsRepository.find({ deleted_at: QueryIs.NOT_NULL });
        const nullResults = await logsRepository.find({ deleted_at: QueryIs.NULL });

        expect(results.length).toBe(0)
        expect(nullResults.length).toBe(1)
    })

    test('Soft deleting', async () => {
        await addLog();
        await logsRepository.softDelete({ id: 1 })

        const results = await logsRepository.find({ deleted_at: QueryIs.NOT_NULL });
        const nullResults = await logsRepository.find({ deleted_at: QueryIs.NULL });

        expect(results.length).toBe(1)
        expect(nullResults.length).toBe(0)
    })

    test('Soft find', async () => {
        await addLog();
        await logsRepository.softDelete({ id: 1 })

        const softFound = await logsRepository.softFind({ id: 1 });
        const softFoundWithoutWhere = await logsRepository.softFind();

        expect(softFound.length).toBe(0)
        expect(softFoundWithoutWhere.length).toBe(0)
    })
})