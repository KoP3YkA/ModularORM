/**
 * Represents the parameters required to establish a connection to a database.
 * This interface contains essential information for connecting to a specific database instance.
 *
 * @param user - The username used for authenticating the database connection.
 * @param password - The password associated with the provided `user` for authentication.
 * @param database - The name of the database to which the connection is being made.
 * @param host - The host address of the database server (e.g., `localhost` or IP address).
 * @param port - The port number through which the database server can be accessed (e.g., `3306` for MySQL).
 */
export interface DatabaseParams {

    user: string;
    password: string;
    database: string;
    host: string;
    port: number;

}