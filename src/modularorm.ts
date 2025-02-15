import {Singleton} from "./decorators/Singleton";
import {Nothing} from "./types/Nothing";
import {DatabaseParams} from "./interfaces/DatabaseParams";
import {Database} from "./classes/abstract/Database";
import {DatabaseAPI} from "./classes/base/DatabaseAPI";
import {DatabaseUpdate} from "./classes/base/DatabaseUpdate";

/**
 * Main class for managing the ORM system.
 * Implements the Singleton pattern to ensure a single instance of the class.
 * @decorators Singleton
 */
@Singleton
export class ModularORM {

    private static instance : ModularORM;
    public database? : Database;

    private constructor() {}

    /**
     * Establishes a connection to the database and initializes the ORM system.
     * @param databaseParams - The parameters required to connect to the database.
     * @returns Nothing.
     */
    public async start(databaseParams: DatabaseParams) : Nothing {
        await Database.connect(databaseParams);
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