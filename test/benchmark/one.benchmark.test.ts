import {Repository} from "../../src";
import {Benchmark} from "../setup/Benchmark";

describe("Benchmark one", () => {
    it("Creating 100.000 rows", async () => {
        const repository = new Repository(Benchmark);
        await repository.deleteAll();

        let startTime = performance.now();
        for (let i = 1; i <= 100_000; i++) {
            await repository.insert({ title: `Some title ${i}`, views: i, is_banned: false })
        }
        let endTime = performance.now();
        console.log(`${(endTime-startTime) / 1000} s - insert`)
        // Lasted test: 12.8989424 s - insert

        startTime = performance.now();
        const results = await repository.find()
        endTime = performance.now();
        console.log(`${endTime-startTime} ms - select`)
        // Lasted test: 79.30090000000018 ms - select
    }, 1000 * 1000)
})