//########################################
// Logs table with soft delete support
//########################################
import {
    AutoIncrementId,
    Column,
    ColumnType,
    ModularORM,
    Module,
    NamedTable,
    Repository,
    SoftDeleteColumn,
    Table
} from "../src";
import {QueryIs} from "../src/classes/base/QueryIs";

@Table({ comment: "Logs table" })
@NamedTable("logs")
class Logs extends Module {
    @AutoIncrementId()
    public id!: number;

    @Column({
        type: ColumnType.VARCHAR(255),
        notNull: true,
        comment: "Log content",
    })
    public content!: string;

    @SoftDeleteColumn()
    public deleted_at?: Date | QueryIs;
}

(async () => {
    const orm = ModularORM.getInstance();
    await orm.start({
        host: "localhost",
        user: "root",
        password: "1",
        database: "orm",
        port: 3306,
        connectionType: "pool",
        checkTablesExists: false,
        validationErrors: false,
    });

    const logsRepo = new Repository(Logs);

    // Clear all logs first
    await logsRepo.deleteAll();

    // Insert a new log
    await logsRepo.insert({ content: "SomeNickName joined the game" });

    // Find logs where deleted_at IS NOT NULL (should be zero)
    const deletedLogs = await logsRepo.find({ deleted_at: QueryIs.NOT_NULL });
    console.log("Deleted logs count (expected 0):", deletedLogs.length);

    // Find logs where deleted_at IS NULL (should be one)
    const activeLogs = await logsRepo.find({ deleted_at: QueryIs.NULL });
    console.log("Active logs count (expected 1):", activeLogs.length);

    // Soft delete the inserted log by id
    await logsRepo.softDelete({ id: 1 });

    // After soft delete: deleted_at IS NOT NULL (should be one)
    const deletedAfterSoftDelete = await logsRepo.find({ deleted_at: QueryIs.NOT_NULL });
    console.log("Deleted logs after softDelete (expected 1):", deletedAfterSoftDelete.length);

    // After soft delete: deleted_at IS NULL (should be zero)
    const activeAfterSoftDelete = await logsRepo.find({ deleted_at: QueryIs.NULL });
    console.log("Active logs after softDelete (expected 0):", activeAfterSoftDelete.length);

    // softFind respects soft deleted status and excludes deleted records by default
    const softFound = await logsRepo.softFind({ id: 1 });
    console.log("softFind result for id=1 (expected 0):", softFound.length);

    // softFind with no where condition (also returns nothing due to soft deleted records)
    const softFoundAll = await logsRepo.softFind();
    console.log("softFind result for all (expected 0):", softFoundAll.length);
})();