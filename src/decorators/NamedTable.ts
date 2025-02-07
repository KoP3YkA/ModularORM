export function NamedTable(tableName: string): ClassDecorator {
    return (target: Function) => {
        Object.defineProperty(target, 'table', {
            get() {
                return tableName;
            },
            enumerable: true,
            configurable: true
        });
    };
}