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
     * Whether to throw new errors when validation fails in the Repository.
     */
    validationErrors?: boolean;
}