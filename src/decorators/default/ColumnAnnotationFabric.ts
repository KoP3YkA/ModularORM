import {ColumnParams} from "../../interfaces/ColumnParams";
import {Column} from "../Column";

export class ColumnAnnotationFabric {

    public static create(column: Partial<ColumnParams>) {
        return Column(column);
    }

}