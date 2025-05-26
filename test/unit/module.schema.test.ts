import {setupOrm} from "../setup.orm";
import {Repository} from "../../src";
import {Users, UsersDTO} from "../setup/Users";
import {ModuleSchema} from "../../src/classes/adapter/ModuleSchema";
import {MemberDTO, Members} from "../setup/Members";
import {Courses} from "../setup/Courses";
import {Logs} from "../setup/Logs";

beforeAll(async () => {
    await setupOrm()
})

describe('Module schema test', () => {
    test('Module names', async () => {
        expect(new ModuleSchema(Members).getName()).toBe('members')
        expect(new ModuleSchema(Users).getName()).toBe('users')
        expect(new ModuleSchema(Courses).getName()).toBe('courses')
    })

    test('Columns', async () => {
        expect(new ModuleSchema(Users).getColumns().length).toBe(3)
        expect(new ModuleSchema(Courses).getColumns().length).toBe(2)
        expect(new ModuleSchema(Logs).getColumns().length).toBe(3)
    })

    test('Primary key names', async () => {
        expect(new ModuleSchema(Members).getAutoincrementKey()).toBe('id')
        expect(new ModuleSchema(MemberDTO).getResultName( new ModuleSchema(Members).getAutoincrementKey() as string )).toBe('memberId')
        expect(new ModuleSchema(Users).getAutoincrementKey()).toBe('id')
        expect(new ModuleSchema(UsersDTO).getResultName( new ModuleSchema(Users).getAutoincrementKey() as string )).toBe('userId')
    })

    test('From name', async () => {
        expect(ModuleSchema.fromName('users')).not.toBeNull();
        expect(ModuleSchema.fromName('courses')).not.toBeNull();
    })
})