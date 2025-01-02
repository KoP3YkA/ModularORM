import {Errors} from "../base/Errors";

export abstract class Module {

    public static get table() : string {
        Errors.METHOD_NOT_IMPLEMENTED.throw();
        return "Error";
    }

}