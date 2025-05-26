export interface IJoinTable {
    target: Function;
    propertyKey: string;
    name?: string;
    onDelete?: "CASCADE" | "SET NULL" | "RESTRICT"
}