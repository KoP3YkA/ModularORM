import {Database} from "../classes/abstract/Database";
import 'reflect-metadata';
import {SqlFunctions} from "../classes/base/SqlFunctions";
import {System} from "../namespaces/System";
import {Logger} from "../classes/Logger";
import {TableCreateParams} from "../interfaces/TableCreateParams";

/**
 * Table decorator.
 * This decorator is used to define a class as a database entity and generate the corresponding SQL for table creation.
 * It automatically maps the columns defined in the class using the `@Column` decorator into an SQL `CREATE TABLE` statement.
 * The decorator adds the generated SQL statement to the list of table creation queries.
 *
 * The `table` static property of the class should specify the name of the database table.
 *
 * @param params
 */
export const Table = (params?: Partial<TableCreateParams>) => {
    return function (target: Function) {
        System.BUILD_SCHEMA.set(target, params ?? {})
    }
}