<p align="center">
<img src="./images/modularorm.png" alt="ModularORM Logo" width="200" />
</p>

<p align="center">
Lightweight, fully object-oriented ORM library for TypeScript and MySQL. It is designed for simplicity and strong type safety, with a class-based API built around decorators.
</p>

<p align="center">
<img src="https://github.com/KoP3YkA/ModularORM/actions/workflows/tests.yml/badge.svg" alt="Test Badge" />
  <a href="https://badge.fury.io/js/modular-orm">
    <img src="https://badge.fury.io/js/modular-orm.svg" alt="npm version" />
  </a>

</p>

---

| Description                        |  Result  |
|------------------------------------|:--------:|
| Sending 100.000 INSERT queries     |   13s    |
| Selecting 100.000 objects with DTO |   79ms   |
| Lines of code needed to connect    |    7     |
| Test coverage                      |  66.82%  |
| Dist size                          |  340kb   |

---

## Features
- Fully OOP Structure: Define tables, columns, and relationships using TypeScript classes.

- Minimal Setup: Simple to configure and get started with-just a few lines of code.

- Up and down migrations with files (or auto)

- Class-Based DTO Mapping: Map query results to custom classes using `@Result()` decorators.

- Repository Pattern Out of the Box: Create repositories with `new Repository(Class)` - no boilerplate or registration needed.

- Validation and Transforms: Add validation and data transformation logic directly to your models with built-in or custom tools.

- Logger: you can add logger method in your module and handle all queries

- Intuitive architecture: `repository.find({ userId: [1, 2] })` - select all from ur table where userId is 1 or 2

- Caching: build-in in-memory cache system without `Redis` and flexible settings

- Typed Information Schema Access: Query database metadata through typed APIs.

And more. You can see examples in [GitHub repository](https://github.com/KoP3YkA/ModularORM/tree/main/example)

ModularORM is ideal for developers who want a clean, type-safe ORM experience with full control and minimal overhead.

## Examples

[Full documentation text](https://github.com/KoP3YkA/ModularORM/wiki)

Connecting to the database
```typescript
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
```

Creating tables
```typescript
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
```

Creating DTOs with validation and transforms
```typescript
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
```

Creating repository
```typescript
const repo = new Repository(Users, UserDTO); // With DTO
const repotwo = new Repository(Users); // Without DTO
```

Queries
```typescript
// SELECT * FROM users WHERE first_name = "Alex" OR last_name = "Smith"
const res : Users[] = await repotwo.find({ first_name: ["Alex"], last_name: "Smith" })
// SELECT * FROM users WHERE (id = 1 OR id = 2) ORDER BY id DESC LIMIT 1
const restwo : UserDTO[] = await repo.find({ id: [1, 2] }, { limit: 1, order: { id: "DESC" } })
```