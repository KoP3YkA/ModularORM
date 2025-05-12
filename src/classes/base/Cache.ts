import {Settings} from "./Settings";
import {Logger} from "../Logger";

export interface ICache {
    ttl: number,
    sql: string,
    escape: any[],
    result: any[],
    date: number,
    table: string,
    used: number
}

export class Cache {

    private static SELECT_QUERIES : Set<ICache> = new Set();
    private static MAX_CACHE_SIZE = 1000;

    private static getTableNameOfSql(sql: string): string {
        sql = sql.trim().toUpperCase();

        const tableNameRegex = /(?:FROM|INTO|UPDATE|DELETE)\s+([`"]?)(\w+)\1/i;

        if (sql.startsWith("SELECT")) {
            const match = sql.match(/FROM\s+([`"]?)(\w+)\1/i);
            if (match) {
                return match[2];
            }
        }
        else if (sql.startsWith("UPDATE")) {
            const match = sql.match(/UPDATE\s+([`"]?)(\w+)\1/i);
            if (match) {
                return match[2];
            }
        }
        else if (sql.startsWith("INSERT INTO")) {
            const match = sql.match(/INSERT\s+INTO\s+([`"]?)(\w+)\1/i);
            if (match) {
                return match[2];
            }
        }
        else if (sql.startsWith("DELETE FROM")) {
            const match = sql.match(/DELETE\s+FROM\s+([`"]?)(\w+)\1/i);
            if (match) {
                return match[2];
            }
        }
        else if (sql.startsWith("MERGE INTO")) {
            const match = sql.match(/MERGE\s+INTO\s+([`"]?)(\w+)\1/i);
            if (match) {
                return match[2];
            }
        }
        else if (sql.startsWith("TRUNCATE TABLE")) {
            const match = sql.match(/TRUNCATE\s+TABLE\s+([`"]?)(\w+)\1/i);
            if (match) {
                return match[2];
            }
        }

        const generalMatch = sql.match(tableNameRegex);
        if (generalMatch) {
            return generalMatch[2];
        }

        return 'unknown';
    }

    private static getCacheSize() : number {
        if (this.SELECT_QUERIES.size === 0) return 0;
        if (Settings.cacheSizeEstimationType === 'memoryUsage') return this.getMemoryUsageCacheSize();
        else return this.getApproximateCacheSize();
    }

    private static getMemoryUsageCacheSize(): number {
        const memoryUsage = process.memoryUsage();
        return memoryUsage.rss / (1024 * 1024);
    }

    private static getApproximateCacheSize(): number {
        let totalSize = 0;

        for (const cacheItem of this.SELECT_QUERIES) {
            const cacheItemSize = Buffer.byteLength(JSON.stringify(cacheItem), 'utf8');
            totalSize += cacheItemSize;
        }

        return totalSize / (1024 * 1024);
    }

    private static deleteFirstCache() {
        if (this.SELECT_QUERIES.size < this.MAX_CACHE_SIZE) return;

        let leastUsed: ICache | null = null;
        for (const cache of this.SELECT_QUERIES) {
            if (!leastUsed || cache.used < leastUsed.used) {
                leastUsed = cache;
            }
        }

        if (leastUsed) {
            this.SELECT_QUERIES.delete(leastUsed);
        }
    }

    private static arraysEqual(arr1: any[], arr2: any[]): boolean {
        if (arr1.length !== arr2.length) return false; // Проверка длины

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false; // Сравнение элементов
        }
        return true;
    }

    private static getCacheByEscape(sql: string, escape: any[]) : ICache | undefined {
        for (const i of this.SELECT_QUERIES) {
            if (i.sql === sql && this.arraysEqual(escape, i.escape)) {
                i.used++
                return i
            }
        }
        return undefined
    }

    private static delCacheByEscape(sql: string, escape: any[]) {
        for (const i of this.SELECT_QUERIES) {
            if (i.sql === sql && this.arraysEqual(escape, i.escape)) this.SELECT_QUERIES.delete(i)
        }
    }

    public static setCache(sql: string, escape : any[], res: any[], ttl: number = 300) {
        if (!Settings.useCache) return;
        if (this.getCacheSize() >= Settings.maxMemoryUsage) {
            Logger.warn('Failed to add item to cache: cache is full')
            return;
        }
        this.deleteFirstCache();
        this.SELECT_QUERIES.add({ sql, ttl, result: res, date: Date.now() / 1000, table: this.getTableNameOfSql(sql), escape, used: 1 })
    }

    public static clearCache() {
        this.SELECT_QUERIES.clear()
    }

    public static getCache(sql: string, escape: any[]) : any[] | undefined {
        if (!Settings.useCache) return undefined;
        const response : ICache | undefined = this.getCacheByEscape(sql, escape);
        if (!response) return undefined;
        if (Date.now() / 1000 - response.date > response.ttl) {
            this.delCacheByEscape(sql, escape)
            return undefined;
        }
        return response.result;
    }

    public static delCache(sql: string, escape: any[]) {
        if (!Settings.useCache) return;
        const tableName : string = this.getTableNameOfSql(sql)
        for (const i of this.SELECT_QUERIES) if (i.table === tableName) this.SELECT_QUERIES.delete(i)
    }

}