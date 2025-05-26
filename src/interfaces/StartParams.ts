import {DatabaseParams} from "./DatabaseParams";
import {Module} from "../classes/abstract/Module";

export interface StartParams extends DatabaseParams {
    /**
     * Whether to enable logging from the library.
     */
    logs?: boolean;

    /**
     * List of entities to be registered in the ORM.
     */
    entities?: Module[];

    /**
     * Outputs a log to the console about invalid validation, removing invalid DTOs from the results array
     */
    validationErrors?: boolean;

    /**
     * Maximum memory allowed for the cache in MB.
     * If not provided, the default value will be used.
     */
    maxMemoryUsageMB?: number;

    /**
     * The type of cache size estimation to use.
     * - `memoryUsage`: Uses Node.js process memory usage for accurate cache size estimation.
     * - `approximate`: Uses approximate estimation based on JSON.stringify size of cached items.
     * Default is `approximate`.
     */
    cacheSizeEstimationType?: 'memoryUsage' | 'approximate';

    /**
     * Will ORM use cache?
     */
    useCache?: boolean;

    /**
     * Type of migrations
     */
    migrations?: 'auto' | 'file';

    /**
     * Should transactions be rolled back automatically in case of exceptions?
     */
    rollbackTransactionsErrors?: boolean;

    /**
     * Type of connection. Default - pool
     */
    connectionType?: 'connection' | 'pool';

    /**
     * When errors occur, methods will return default values.
     */
    returnsNullWhenErrors?: boolean;

    /**
     * Before creating tables, it will check if they exist in the database. If false is specified, CREATE TABLE IF NOT EXISTS will be used.
     */
    checkTablesExists?: boolean;
}