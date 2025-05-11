import {Nothing} from "./types/Nothing";
import {DatabaseParams} from "./interfaces/DatabaseParams";
import {Database} from "./classes/abstract/Database";
import {DatabaseAPI} from "./classes/base/DatabaseAPI";
import {DatabaseUpdate} from "./classes/base/DatabaseUpdate";
import {StartParams} from "./interfaces/StartParams";
import {Settings} from "./classes/base/Settings";

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

        await Database.connect(this.pickDatabaseParams(databaseParams));
        this.database = new DatabaseAPI();
        await Database.init();
        await DatabaseUpdate.updateTables();
    }

    /**
     * Retrieves the single instance of the ModularORM class (Singleton pattern).
     * @returns The single instance of the ModularORM class.
     */
    public static get getInstance() : ModularORM {
        if (!this.instance) this.instance = new ModularORM();
        return this.instance;
    }

}