import {ModularORM} from "../src";
import {Courses} from "./setup/Courses";
import {Logs} from "./setup/Logs";
import {Members} from "./setup/Members";
import {Ranks} from "./setup/Ranks";
import {Students} from "./setup/Students";
import {Users} from "./setup/Users";
import {Posts} from "./setup/Posts";
import {Comments} from "./setup/Comments";

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

    if (isInit) return;
    await ModularORM.getInstance().start({
        host: 'localhost',
        user: 'root',
        password: '1',
        database: 'orm',
        port: 3306,
        useCache: true,
        migrations: 'file',
    })
    isInit = true;
}