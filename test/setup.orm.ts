import * as dotenv from 'dotenv'
dotenv.config({ override: true })
import {ModularORM} from "../src";
import {Courses} from "./setup/Courses";
import {Logs} from "./setup/Logs";
import {Members} from "./setup/Members";
import {Ranks} from "./setup/Ranks";
import {Students} from "./setup/Students";
import {Users} from "./setup/Users";
import {Posts} from "./setup/Posts";
import {Comments} from "./setup/Comments";
import {Benchmark} from "./setup/Benchmark";

let isInit : boolean = false;

export const setupOrm = async () => {
    new Courses();
    new Logs();
    new Members();
    new Ranks();
    new Students();
    new Users();
    new Posts();
    new Comments();
    new Benchmark();

    if (isInit) return;
    await ModularORM.getInstance().start({
        host: process.env.MYSQL_HOST || '127.0.0.1',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'test',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        useCache: true,
        migrations: 'file',
    });
    isInit = true;
}