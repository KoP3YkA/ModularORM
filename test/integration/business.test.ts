import {
    Repository,
} from "../../src";
import {Users, UsersDTO} from "../setup/Users";
import {describe} from "node:test";
import {setupOrm} from "../setup.orm";

beforeAll(async () => {
    await setupOrm()
})

const usersRepository = new Repository(Users);
const dtoUsersRepository = new Repository(Users, UsersDTO);

beforeEach(async () => {
    await usersRepository.deleteAll();
})

describe('Base business logic', () => {
    test('Empty database size', async () => {
        const results = await usersRepository.find();

        expect(results.length).toBe(0)
    })

    test('Insert queries', async () => {
        await usersRepository.insert({ name: 'John', money: '3000' });

        const results = await usersRepository.find();

        expect(results.length).toBe(1)
    })

    test('Select queries', async () => {
        await usersRepository.insert({ name: 'Alex', money: '5000' });
        await usersRepository.insert({ name: 'Liza', money: '100' });

        const results = await usersRepository.findOne({ money: '100' });

        expect(results).not.toBeNull();

        if (results) expect(results.name).toBe('Liza')

        const dtoResult = await dtoUsersRepository.find({ name: 'Alex' });

        expect(dtoResult.length).not.toBe(0);

        if (dtoResult.length !== 0) {
            expect(typeof dtoResult[0].money).toBe('number');
            expect(dtoResult[0].money).toBe(5000);
        }

        const validateResults = await dtoUsersRepository.find({}, { order: { id: 'DESC' } })
        expect(validateResults[0].userName).toBe('Liza')

        const resultById = await dtoUsersRepository.findByAutoincrementKey(1)

        expect(resultById.length).not.toBe(0);

        if (resultById.length !== 0) {
            expect(resultById[0].userName).toBe('Alex')
        }

        await usersRepository.insert({ name: 'Ivan', money: '2000' });

        const orResults = await dtoUsersRepository.find({ name: ['Alex', 'Liza'] });

        expect(orResults.length).toBe(2);
    })

    test('Update queries', async () => {
        await usersRepository.insert({ name: 'Alex', money: '5000' });
        await usersRepository.insert({ name: 'Liza', money: '100' });
        await usersRepository.insert({ name: 'Michael', money: '6000' });

        await usersRepository.update({ money: '0' }, { name: ['Alex', 'Liza'] })

        const result = await dtoUsersRepository.findOne({ name: 'Liza' })
        expect(result).not.toBeNull();
        if (result) {
            expect(result.money).toBe(0);
        }
    })

    test('Save method', async () => {
        const user = new Users();
        user.name = 'Joe';
        user.money = '4000';

        await usersRepository.save(user);

        let results = await usersRepository.find();

        expect(results.length).toBe(1);

        if (results.length !== 0) {
            const selectedUser = results[0];
            selectedUser.money = '3000';

            await usersRepository.save(selectedUser);
        }

        results = await usersRepository.find({ name: 'Joe' });

        expect(results.length).toBe(1);

        if (results.length !== 0) expect(+results[0].money).toBe(3000)
    })

    test('Clone', async () => {
        await usersRepository.insert({ name: 'Kamilla', money: '30' });
        await usersRepository.clone({ name: 'Kamilla' }, { name: 'Boris' });

        const results = await dtoUsersRepository.find();

        expect(results.length).toBe(2)
    })

    test('Deleting rows', async () => {
        await usersRepository.insert({ name: 'Sergey', money: '20000' });
        await usersRepository.delete({ name: 'Sergey' });

        const results = await dtoUsersRepository.find()

        expect(results.length).toBe(0)
    })
})