import {BaseEnumClass} from "../abstract/BaseEnumClass";

export class Errors extends BaseEnumClass {

    public static METHOD_NOT_IMPLEMENTED : Errors = new Errors('Method not implemented!');
    public static BUILDER_DONT_HAVE_BUILD_METHOD : Errors = new Errors('This Builder class dont have a build() method! U cant use this.');
    public static MISSING_SELECT_FIELD_IN_SELECT_QUERY : Errors = new Errors('Missing select field in select query!');
    public static MISSING_UPDATE_FIELD : Errors = new Errors('Missing UPDATE fields in this query type!');
    public static MISSING_INSERT_FIELD : Errors = new Errors('Missing INSERT builder in INSERT query!');
    public static DONT_USE_IT_THERE : Errors = new Errors('U cant use it there!');

    // --------------------------------------

    public constructor(
        public description : string,
    ) {super();}

    public throw() : void {
        throw new Error(this.description);
    }

}