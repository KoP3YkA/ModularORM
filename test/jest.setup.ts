import {setupOrm} from "./setup.orm";

beforeAll(async () => {
    await setupOrm()
})