/**
 * @user - user of DB
 * @password - password of DB
 * @database - name of DB
 * @host - host
 * @port - port of DB
 */
export interface DatabaseParams {

    user: string;
    password: string;
    database: string;
    host: string;
    port: number;

}