import {Settings} from "./base/Settings";
import chalk from "chalk";

export class Logger {

    public static info(message: string) {
        if (Settings.logs) console.log(chalk.green('[ ModularORM ] ') + message)
    }

    public static error(message: string) {
        console.log(chalk.red('[ ModularORM ] ') + message)
    }

    public static warn(message: string) {
        console.log(chalk.yellowBright(`[ ModularORM ] ${message} | WARN`))
    }

}