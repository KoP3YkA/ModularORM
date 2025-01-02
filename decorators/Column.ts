import {ColumnType} from "../classes/base/ColumnType";
import {ColumnParams} from "../interfaces/ColumnParams";
import 'reflect-metadata'

export function Column(params: Partial<ColumnParams>) {
    return function (target: any, propertyKey: string) {
        // Получаем существующие метаданные столбцов
        const existingColumns = Reflect.getMetadata("columns", target) || [];

        // Добавляем новый столбец в метаданные
        existingColumns.push({
            propertyKey,
            params: {
                ...params,
                type: params.type || ColumnType.VARCHAR,
                autoIncrement: params.autoIncrement || false,
                notNull: params.notNull || false,
                defaultValue: params.defaultValue !== undefined ? params.defaultValue : null
            }
        });

        // Сохраняем обновленные метаданные
        Reflect.defineMetadata("columns", existingColumns, target);
    };
}