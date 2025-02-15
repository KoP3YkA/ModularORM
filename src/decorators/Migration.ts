import {MigrationType} from "../enums/MigrationType";
import {System} from "../namespaces/System";

export function Migration(...migrations: MigrationType[]) {
    return function (target: Function) {
        if (!System.MIGRATION_TABLES.has(target)) System.MIGRATION_TABLES.set(target, new Set())
        const list = System.MIGRATION_TABLES.get(target) as unknown as Set<MigrationType>
        migrations.forEach(type => list.add(type));
    }
}