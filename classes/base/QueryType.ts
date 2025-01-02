import {BaseEnumClass} from "../abstract/BaseEnumClass";
import {OrNull} from "../../types/Or";

export class QueryType extends BaseEnumClass {

    public static INSERT : QueryType = new QueryType('INSERT', 'INTO');
    public static SELECT : QueryType = new QueryType('SELECT', null);
    public static DELETE : QueryType = new QueryType('DELETE', 'FROM');
    public static DROP : QueryType = new QueryType('DROP', 'TABLE');
    public static UPDATE : QueryType = new QueryType('UPDATE', null);
    public static TRUNCATE : QueryType = new QueryType('TRUNCATE', 'TABLE');

    // ------------------------------------------------------

    public constructor(
        public type : string,
        public nextWord : OrNull<string>,
    ) {super();}

}