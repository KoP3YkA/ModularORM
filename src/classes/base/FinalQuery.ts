import {QueryBuilder} from "./QueryBuilder";
import {Nothing} from "../../types/Nothing";
import {SQLQueryBuilder} from "./SQLQueryBuilder";
import {Query} from "../../interfaces/Query";
import {DatabaseAPI} from "./DatabaseAPI";
import {QueryEvent} from "../../interfaces/QueryEvent";
import {QueryType} from "./QueryType";
import {QueryEventType} from "../../interfaces/QueryEventType";
import {QueryExecuteType} from "../../enums/QueryExecuteType";
import {System} from "../../namespaces/System";
import {Module} from "../abstract/Module";
import {Logger} from "../Logger";
import {Settings} from "./Settings";
import {throws} from "node:assert";
import {ModularORMException} from "./ModularORMException";
import {HandleExceptions} from "../../decorators/HandleExceptions";

/**
 * Represents a final SQL query built by the `QueryBuilder`.
 *
 * This class takes a `QueryBuilder` instance and converts it into a SQL query string, which can then
 * be executed on the database. The resultAnnotations of the query can be retrieved either by executing it for its
 * side effects or by fetching the rows as objects of a specific type.
 */
export class FinalQuery {

    public builder : QueryBuilder;
    private sql!: string;
    private values!: any[]

    private table!: string;
    private type!: QueryType;

    /**
     * Creates an instance of the `FinalQuery` class.
     *
     * @param builder - The `QueryBuilder` instance used to build the query.
     */
    public constructor(builder: QueryBuilder) {
        this.builder = builder;
    }

    /**
     * Converts the builder into a valid SQL query string and parameters.
     * This method is called automatically before executing or fetching results.
     */
    private toString() : void {
        const result : Query & QueryEvent = new SQLQueryBuilder(this.builder).toQuery();
        this.sql = result.sql;
        this.values = result.params;
        this.type = result.type;
        this.table = result.table;
    }

    private handleEvent(params: Query & QueryEvent & QueryEventType) : void {
        let _class = System.TABLES.get(this.table)
        if (!_class) return;
        const executorMethod : string | undefined = System.EVENT_HANDLERS.get(_class)
        if (!executorMethod) return;

        _class = _class as {new () : Module};
        const tableClass = new _class();
        tableClass[executorMethod](params)
    }

    /**
     * Executes the query for its side effects (e.g., INSERT, UPDATE, DELETE).
     * This method sends the generated SQL query and parameters to the database.
     *
     * @returns {Promise<void>} A promise that resolves when the query has been executed.
     */
    public async execute() : Nothing {
        this.toString()
        const result = await new DatabaseAPI().databaseSetQuery({
            sql: this.sql,
            params: this.values,
            useCache: this.builder.useCache,
            cacheTTL: this.builder.cacheTTL
        })
        this.handleEvent({table: this.table, type: this.type, params: this.values, sql: this.sql, execute: QueryExecuteType.SET})
        return result;
    }

    /**
     * Executes the query and maps the resultAnnotations rows to instances of the provided class.
     *
     * @param ctor - The constructor of the class to map the rows to.
     *
     * @returns {Promise<T[]>} A promise that resolves to an array of mapped instances of the specified class.
     * @template T - The type of the resultAnnotations class.
     */
    public async get<T extends Object>(ctor: new (...args: any[]) => T) : Promise<T[]> {
        this.toString();

        const dbResult : any[] = await new DatabaseAPI().databaseGetQuery({
            sql: this.sql,
            params: this.values,
            useCache: this.builder.useCache,
            cacheTTL: this.builder.cacheTTL
        });

        const res = dbResult.map(row => {
            let resultInstance = new ctor();
            const prototype = ctor.prototype;
            const columnMappings = System.MAPPING_CACHE.get(prototype) ?? (() => {
                const m = Reflect.getMetadata('resultAnnotations-mapping-list', prototype) || [];
                System.MAPPING_CACHE.set(prototype, m);
                return m;
            })();
            let error : boolean = false;

            const transformMap = System.TRANSFORMS.get(resultInstance.constructor) ?? null;
            const validatorSet = System.VALIDATORS.get(resultInstance.constructor) ?? null;

            for (const { propertyKey, columnName } of columnMappings) {
                if (!columnName || !row.hasOwnProperty(columnName)) continue;

                let entryResult = row[columnName];

                if (transformMap) {
                    const thisColumnResult = transformMap.get(propertyKey)
                    if (thisColumnResult) entryResult = thisColumnResult(entryResult)
                }

                (resultInstance as any)[propertyKey] = entryResult;

                if (!validatorSet) continue;

                const thisColumnValidators : (Map<string, {func: (value: any, column: string) => boolean, message: string}>)[] = Array.from(validatorSet).filter(obj => obj.get(propertyKey))
                if (thisColumnValidators.length < 1) continue;

                thisColumnValidators.forEach(obj => {
                    const validatorFunc = obj.get(propertyKey)

                    if (validatorFunc && validatorFunc.func && !validatorFunc.func(entryResult, propertyKey)) {
                        if (Settings.validationErrors) {
                            if (Settings.logs) throw new ModularORMException(`Validation error: ${validatorFunc.message}`);
                            error = true;
                        } else {
                            const instanceErrors = (resultInstance as any)['validateErrors']
                            if (instanceErrors instanceof Set) {
                                instanceErrors.add(validatorFunc.message)
                            }
                        }
                    }

                })

            }

            if (!error) return resultInstance;
            else return null
        }).filter(obj => obj !== null);
        this.handleEvent({table: this.table, type: this.type, params: this.values, sql: this.sql, execute: QueryExecuteType.GET})
        return res;
    }

}