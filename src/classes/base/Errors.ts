import {BaseEnumClass} from "../abstract/BaseEnumClass";
import {ModularORMException} from "./ModularORMException";

export class Errors extends BaseEnumClass {

    public static METHOD_NOT_IMPLEMENTED : Errors = new Errors('Method not implemented.');
    public static BUILDER_MISSING_BUILD_METHOD : Errors = new Errors('This Builder class does not have a build() method. You cannot use it.');
    public static MISSING_SELECT_FIELD_IN_SELECT_QUERY : Errors = new Errors('Missing select field in the select query.');
    public static MISSING_UPDATE_FIELDS : Errors = new Errors('Missing UPDATE fields in this query type.');
    public static MISSING_INSERT_FIELDS : Errors = new Errors('Missing INSERT fields in the INSERT query.');
    public static INVALID_USAGE : Errors = new Errors('You cannot use this here.');
    // --------------------------------------

    public constructor(
        public description : string,
    ) {super();}

    public throw() : void {
        throw new ModularORMException(this.description);
    }

}