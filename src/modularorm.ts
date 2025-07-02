import {Nothing} from "./types/Nothing";
import {DatabaseParams} from "./interfaces/DatabaseParams";
import {Database} from "./classes/abstract/Database";
import {DatabaseAPI} from "./classes/base/DatabaseAPI";
import {DatabaseUpdate} from "./classes/base/DatabaseUpdate";
import {StartParams} from "./interfaces/StartParams";
import {Settings} from "./classes/base/Settings";
import {System} from "./namespaces/System";
import {Cache} from "./classes/base/Cache";

/**
 * Main class for managing the ORM system.
 * Implements the Singleton pattern to ensure a single instance of the class.
 * @decorators Singleton
 */
export class ModularORM {

    private static instance : ModularORM;
    public database? : Database;

    private constructor() {}

    private pickDatabaseParams(params: StartParams): DatabaseParams {
        const { host, port, user, password, database } = params;
        return { host, port, user, password, database };
    }

    /**
     * Establishes a connection to the database and initializes the ORM system.
     * @param databaseParams - The parameters required to connect to the database.
     * @returns Nothing.
     */
    public async start(databaseParams: StartParams) : Nothing {
        if (typeof databaseParams.validationErrors === 'boolean') Settings.validationErrors = databaseParams.validationErrors;
        else Settings.validationErrors = false;

        if (typeof databaseParams.logs === 'boolean') Settings.logs = databaseParams.logs;
        else Settings.logs = false;

        if (!databaseParams.maxMemoryUsageMB) Settings.maxMemoryUsage = 80;
        else Settings.maxMemoryUsage = databaseParams.maxMemoryUsageMB;

        if (!databaseParams.cacheSizeEstimationType) Settings.cacheSizeEstimationType = 'approximate';
        else Settings.cacheSizeEstimationType = databaseParams.cacheSizeEstimationType;

        if (typeof databaseParams.useCache === 'boolean') Settings.useCache = databaseParams.useCache;
        else Settings.useCache = true;

        if (!databaseParams.migrations) Settings.migrations = 'auto';
        else Settings.migrations = databaseParams.migrations;

        if (!databaseParams.rollbackTransactionsErrors) Settings.rollbackTransactionsErrors = true;
        else Settings.rollbackTransactionsErrors = databaseParams.rollbackTransactionsErrors;

        if (!databaseParams.connectionType) Settings.connectionType = 'pool';
        else Settings.connectionType = databaseParams.connectionType;

        if (typeof databaseParams.returnsNullWhenErrors === 'boolean') Settings.returnsNullWhenError = databaseParams.returnsNullWhenErrors;
        else Settings.returnsNullWhenError = false;

        if (typeof databaseParams.checkTablesExists === 'boolean') Settings.checkTablesExists = databaseParams.checkTablesExists;
        else Settings.checkTablesExists = false;

        if (typeof databaseParams.logQueriesValues === 'boolean') Settings.logQueriesValues = databaseParams.logQueriesValues;
        else Settings.logQueriesValues = false;

        const params = this.pickDatabaseParams(databaseParams);
        Settings.databaseName = params.database;

        await Database.connect(params);
        this.database = new DatabaseAPI();
        await Database.init();
        if (System.MIGRATION_TABLES.size !== 0) await DatabaseUpdate.updateTables();
    }

    public clearCache = () : void => Cache.clearCache();

    /**
     * Retrieves the single instance of the ModularORM class (Singleton pattern).
     * @returns The single instance of the ModularORM class.
     */
    public static getInstance() : ModularORM {
        if (!this.instance) this.instance = new ModularORM();
        return this.instance;
    }

}