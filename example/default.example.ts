import {
    ModularORM,
    NamedTable,
    Table,
    Module,
    AutoIncrementId,
    Column,
    ColumnType,
    Result,
    IsSafeString,
    ToNumber, Validate, Repository
} from "../src";

//###############################
// CREATE TABLE IF NOT EXISTS users
// (
//   id INTEGER PRIMARY KEY AUTO_INCREMENT,
//   first_name VARCHAR(64) NOT NULL COMMENT = 'Users first name',
//   last_name VARCHAR(64) NOT NULL COMMENT = 'Users last name',
//   money FLOAT NOT NULL DEFAULT 0 COMMENT = 'Users balance',
//   CREATE INDEX idx_first_name ON users(first_name),
//   CREATE INDEX idx_last_name ON users(last_name)
// ) COMMENT = 'Users table'
//###############################
@Table({ comment: 'Users table' })
@NamedTable('users')
class Users extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(64), notNull: true, comment: 'Users first name', index: true })
    public first_name!: string;

    @Column({ type: ColumnType.VARCHAR(64), notNull: true, comment: 'Users last name', index: true })
    public last_name!: string;

    @Column({ type: ColumnType.FLOAT, notNull: true, comment: 'Users balance', defaultValue: 0 })
    public money!: number;

}

//######################################
// DTO for Users module with validation
//######################################
class UserDTO implements Validate {

    @Result() // Can be empty
    public id!: number;

    @Result('first_name')
    @IsSafeString() // Validator
    public firstName!: string;

    @Result('last_name')
    @IsSafeString() // Validator
    public lastName!: string;

    @Result()
    @ToNumber() // Transform
    public money!: number;

    public validateErrors: Set<string> = new Set(); // Validation errors

}

(async () => {
    const main : ModularORM = ModularORM.getInstance()
    await main.start({
        host: 'localhost',
        user: 'root',
        password: '1',
        database: 'orm',
        port: 3306,
        connectionType: 'pool',
        checkTablesExists: false, // If you want to check if tables are created. If not, it will be IF NOT EXISTS
        validationErrors: false // You can enable this to make validation errors throw real exceptions.
        // And maaany more parameters
    })

    //#######################################
    // Repository
    //#######################################
    const usersRepository = new Repository(Users);

    //#######################################
    // Repository with DTO
    //#######################################
    const dtoUsersRepository = new Repository(Users, UserDTO);

    //#######################################
    // INSERT INTO users (first_name, last_name, money) VALUES ('Joe', 'Jackson', 3000) -- with escapes
    //#######################################
    await usersRepository.insert({ first_name: 'Joe', last_name: 'Jackson', money: 3000 });

    //#######################################
    // INSERT INTO users (first_name, last_name, money) VALUES ('Ivan', 'Ivanov', 200) -- with escapes #2
    //#######################################
    await dtoUsersRepository.insert({ first_name: 'Ivan', last_name: 'Ivanov', money: 200 });

    //#######################################
    // SELECT * FROM users WHERE money = 200
    //#######################################
    const user : Users | null = await usersRepository.findOne({ money: 200 });

    //#######################################
    // SELECT * FROM users WHERE first_name = 'Joe' OR last_name = 'Ivanov'
    //#######################################
    const allUsers : UserDTO[] = await dtoUsersRepository.find({ first_name: ['Joe'], last_name: 'Ivanov' });

    if (!user) return;

    user.money += 500;

    //#######################################
    // UPDATE users SET money = 700, first_name = 'Ivan', last_name = 'Ivanov' WHERE id = 2
    //#######################################
    await usersRepository.save(user);
})()