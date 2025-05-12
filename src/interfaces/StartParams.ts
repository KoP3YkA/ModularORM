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
}