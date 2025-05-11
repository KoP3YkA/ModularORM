import {Database} from "../classes/abstract/Database";
import 'reflect-metadata';
import {SqlFunctions} from "../classes/base/SqlFunctions";
import {System} from "../namespaces/System";
import {Logger} from "../classes/Logger";

/**
 * Table decorator.
 * This decorator is used to define a class as a database entity and generate the corresponding SQL for table creation.
 * It automatically maps the columns defined in the class using the `@Column` decorator into an SQL `CREATE TABLE` statement.
 * The decorator adds the generated SQL statement to the list of table creation queries.
 *
 * The `table` static property of the class should specify the name of the database table.
 *
 * @param target - The class to which this decorator is applied. It should have a static `table` property that defines the table name.
 */
export const Table = (priority: number = 0) => {
    return function (target: any) {
        const columns = Reflect.getMetadata("columns", target) || [];
        const indexSQL: string[] = [];
        const foreignKeysSQL: string[] = [];

        const columnsSQL = columns.map((column: any) => {
            const { propertyKey, params } = column;
            let columnSQL = `\`${propertyKey}\` ${params.type.type}`;

            if (params.autoIncrement) {
                columnSQL += " AUTO_INCREMENT PRIMARY KEY";
            }

            if (params.notNull) {
                columnSQL += " NOT NULL";
            }

            if (params.defaultValue !== null) {
                if (params.defaultValue instanceof SqlFunctions) columnSQL += ` DEFAULT ${params.defaultValue.name}`;
                else if (typeof params.defaultValue === "boolean") columnSQL += ` DEFAULT ${params.defaultValue}`
                else columnSQL += ` DEFAULT '${params.defaultValue}'`;
            }

            if (params.unique) {
                columnSQL += " UNIQUE"
            }

            if (params.index) {
                indexSQL.push(`INDEX idx_${propertyKey} (\`${propertyKey}\`)`);
            }

            if (params.onUpdate !== null) {
                if (params.onUpdate instanceof SqlFunctions) columnSQL += ` ON UPDATE ${params.onUpdate.name}`
                else columnSQL += ` ON UPDATE '${params.onUpdate}'`
            }

            if (params.foreignKey) {
                foreignKeysSQL.push(
                    `FOREIGN KEY (\`${propertyKey}\`) REFERENCES ${params.foreignKey.referencedTable}(${params.foreignKey.referencedColumn})` +
                    (params.onDeleteForeign ? ` ON DELETE ${params.onDeleteForeign}` : '') +
                    (params.onUpdateForeign ? ` ON UPDATE ${params.onUpdateForeign}` : '')
                );
            }

            return columnSQL;
        }).join(", ");

        const tableName = target.table;

        if (String(columnsSQL).length === 0) {
            return Logger.error(`${tableName} is empty!`)
        }

        const foreignKeys = foreignKeysSQL.length > 0
            ? `, ${foreignKeysSQL.join(", ")}`
            : "";
        const indexes = indexSQL.length > 0 ? `, ${indexSQL.join(", ")}` : "";

        const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSQL}${indexes}${foreignKeys});`;
        System.TABLES_NAMES.set(target, tableName)
        System.TABLES_PRIORITY.set(tableName, priority)

        Database.listTables.add(createTableSQL);
    }
}