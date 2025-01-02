import {Singleton} from "./decorators/Singleton";
import {Nothing} from "./types/Nothing";
import {DatabaseParams} from "./interfaces/DatabaseParams";
import {Database} from "./classes/abstract/Database";
import {DatabaseAPI} from "./classes/base/DatabaseAPI";

/**
 * Main class
 * @decorators Singleton
 */
@Singleton
export class ModularORM {

    private static instance : ModularORM;
    public database? : Database;

    private constructor() {}

    /**
     * Create connection to the database
     * @param databaseParams
     */
    public async start(databaseParams: DatabaseParams) : Nothing {
        await Database.connect(databaseParams);
        this.database = new DatabaseAPI();
        await Database.init();
    }

    /**
     * Get instance method
     * @principe Singleton
     * @return ModularORM
     */
    public static get getInstance() : ModularORM {
        if (!this.instance) this.instance = new ModularORM();
        return this.instance;
    }

}