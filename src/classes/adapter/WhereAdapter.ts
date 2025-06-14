import {SelectQueryParams} from "../../interfaces/SelectQueryParams";
import {WhereBuilder} from "../base/WhereBuilder";

export class WhereAdapter {

    public static adapt<T>(where: { [key: string] : any }, params?: Partial<SelectQueryParams<T>>) {
        const whereBuilder : WhereBuilder = new WhereBuilder();

        for (const i of Object.keys(where)) {
            const value = where[i]
            if (Array.isArray(value)) {
                if (value.length === 1) value.forEach(obj => whereBuilder.equalOr(i, obj))
                else {
                    const subbuilder = new WhereBuilder()
                    value.forEach(obj => subbuilder.equalOr(i, obj))
                    whereBuilder.addSubQuery(subbuilder)
                }
            } else whereBuilder.equalAnd(i, value)
        }

        let sql : string = whereBuilder.toString();
        if (!params) return {sql, values: whereBuilder.getValues()};

        if (params.order && typeof params.order === "object") {
            sql += ` ORDER BY `
            sql += Object.entries(params.order).map(obj => String(`${obj[0]} ${obj[1]}`)).join(', ');
        }

        if (params.limit) sql += ` LIMIT ${params.limit}`
        if (params.offset) sql += ` OFFSET ${params.offset}`

        return {sql, values: whereBuilder.getValues()};
    }

}