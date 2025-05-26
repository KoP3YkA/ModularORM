export class Settings {

    public static logs : boolean;
    public static validationErrors : boolean;
    public static maxMemoryUsage : number;
    public static cacheSizeEstimationType : 'memoryUsage' | 'approximate';
    public static useCache : boolean;
    public static migrations : 'auto' | 'file';
    public static rollbackTransactionsErrors: boolean;
    public static connectionType: 'connection' | 'pool';
    public static returnsNullWhenError: boolean;
    public static checkTablesExists: boolean;
    public static databaseName: string;

}