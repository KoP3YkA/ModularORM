import {Database} from "../classes/abstract/Database";
import 'reflect-metadata';

/**
 * Decorator for creating database entities.
 */
export function Table(target: any) {
    const columns = Reflect.getMetadata("columns", target.prototype) || [];

    const columnsSQL = columns.map((column: any) => {
        const { propertyKey, params } = column;
        let columnSQL = `${propertyKey} ${params.type.type}`;

        if (params.autoIncrement) {
            columnSQL += " AUTO_INCREMENT PRIMARY KEY";
        }

        if (params.notNull) {
            columnSQL += " NOT NULL";
        }

        if (params.defaultValue !== null) {
            columnSQL += ` DEFAULT '${params.defaultValue}'`;
        }

        return columnSQL;
    }).join(", ");

    const tableName = target.table;

    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSQL});`;

    Database.listTables.add(createTableSQL);
}