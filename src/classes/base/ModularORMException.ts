export class ModularORMException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ModularORMException'
        Error.captureStackTrace?.(this, this.constructor);
    }
}