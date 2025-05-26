import {setupOrm} from "../setup.orm";
import {PropertyName} from "../../src/classes/adapter/GetPropertyName";

beforeAll(async () => {
    await setupOrm()
})

describe('PropertyName tests', () => {
    test('Default names', async () => {
        expect(PropertyName.getPropertyName((value) => value.userId)).toBe('userId')
    })
    test('Names with []', async () => {
        expect(PropertyName.getPropertyName((value) => value['Imgay'])).toBe('Imgay')
    })
})