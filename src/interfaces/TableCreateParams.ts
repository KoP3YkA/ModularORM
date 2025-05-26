
import {Collation} from "../types/Collation";

export interface TableCreateParams {
    priority: number,
    comment: string,
    collation: Collation,
    rowFormat: "Dynamic" | "Fixed" | "Compressed",
    migrations: boolean
}