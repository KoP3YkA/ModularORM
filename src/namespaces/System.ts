interface Executor {
    prototype: any,
    method: string
}

export namespace System {

    export const TABLES : Map<string, any> = new Map();
    export const EVENT_HANDLERS : Map<any, string> = new Map();

}