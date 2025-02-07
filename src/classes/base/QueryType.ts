import {BaseEnumClass} from "../abstract/BaseEnumClass";
import {OrNull} from "../../types/Or";

/**
 * Enum-like class representing different SQL query types.
 * This class encapsulates various SQL query types, each with an associated string value
 * and an optional next word that is typically used with the query type (e.g., `INTO` for `INSERT`).
 */
export class QueryType extends BaseEnumClass {

    /**
     * Represents an `INSERT` query type, typically followed by the `INTO` keyword.
     */
    public static INSERT : QueryType = new QueryType('INSERT', 'INTO');

    /**
     * Represents a `SELECT` query type. It doesn't have an associated next word.
     */
    public static SELECT : QueryType = new QueryType('SELECT', null);

    /**
     * Represents a `DELETE` query type, typically followed by the `FROM` keyword.
     */
    public static DELETE : QueryType = new QueryType('DELETE', 'FROM');

    /**
     * Represents a `DROP` query type, typically followed by the `TABLE` keyword.
     */
    public static DROP : QueryType = new QueryType('DROP', 'TABLE');

    /**
     * Represents an `UPDATE` query type. It doesn't have an associated next word.
     */
    public static UPDATE : QueryType = new QueryType('UPDATE', null);

    /**
     * Represents a `TRUNCATE` query type, typically followed by the `TABLE` keyword.
     */
    public static TRUNCATE : QueryType = new QueryType('TRUNCATE', 'TABLE');

    // ------------------------------------------------------

    protected constructor(
        public type : string,
        public nextWord : OrNull<string>,
    ) {super();}

}