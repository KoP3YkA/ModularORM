## ModularORM

ModularORM is a powerful and flexible Object-Relational Mapping (ORM) library for TypeScript that allows developers to interact with SQL databases through TypeScript classes. The library abstracts the complexity of SQL queries while offering a rich and extensible API for building complex queries with ease.

### Features

- **Dynamic Query Builder:** Build and execute SQL queries dynamically with classes like ``InsertBuilder``, ``UpdateBuilder``, ``SelectBuilder``, and more.
- **Table Mapping:** Easily map TypeScript classes to database tables using decorators like ``@Table`` and ``@Column``.
- **Column Types:** Use predefined column types (e.g., ``ColumnType.INTEGER``, ``ColumnType.VARCHAR(number)``) or extend them as needed.
- **Custom SQL Functions:** Includes predefined functions like ``CURRENT_TIMESTAMP``, ``UUID()``, and ``RAND()``. Create complex SQL expressions with ``SqlFunctions``.
- **Query Results Mapping:** Automatically map query results to TypeScript class instances with ``@Result`` decorator.
- **Advanced Error Handling:** Comprehensive error management integrated throughout the library.

# Docs

**Installation**
- [Installation](#-installation)

**Usage**
- [Creating a new table](#-creating-a-new-table)
- [Connecting to the Database](#-connecting-to-the-database)
- [Creating Database queries](#-creating-database-queries)
- [Creating select queries](#-creating-select-queries)
- [Creating update queries](#-creating-update-queries)
- [Other queries](#-other-queries)
- [Automatic table updates](#-automatic-table-updates)
- [Default sql functions](#-default-sql-functions)
- [Information Schema](#-information-schema)
- [Custom column annotations](#-custom-column-annotations)
- [Transforms](#-transforms)
- [Creating custom transforms](#-creating-custom-transforms)
- [Validators](#-validators)
- [Validators list](#-validators-list)
- [Custom validators](#-custom-validators)
- [Events](#-events)
- [Default columns](#-default-columns)

## ⛏️ Installation

First, create a TypeScript project, then add the following lines to your `tsconfig.json`:
```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true
```
Next, install the library:
```
npm i modular-orm
```
Check your libraries with `npm ls` to make sure `mysql2` and `reflect-metadata` are listed.

## 🧸 Usage

### 🪄 Creating a new table
To create a new table, you need to create a class that extends `Module`, add the `Table` annotation, and define the columns:
```typescript
@Table
class TestTable extends Module {
    
    @Column({
        type: ColumnType.INTEGER,
        autoIncrement: true,
        notNull: true,
        unique: true
    })
    public id : number = 0;
    
    @Column({
        type: ColumnType.VARCHAR(64),
        notNull: true,
        unique: true
    })
    public userId : string = "";
    
    public static override get table() : string {
        return 'ur_table_name';
    }
    
}
```

But let's simplify the code using features!

```typescript
@Table
@NamedTable('ur_table_name') // Automatically determines the table name without the need to override the method
class TestTable extends Module {

    @AutoIncrementId // This annotation indicates that the column is an auto-incrementing ID.
    public id: number = 0;

    @Column(DefaultColumn.VARCHAR_UUID) // This namespace contains predefined column templates
    public userId: string = "";

}
```

Then, `ModularORM` will automatically convert this class into an SQL query and execute it.

`NOTE`: All classes must be initialized when the project starts or be located in the main file (you can initialize them by creating an instance at startup).
```typescript
export class Main {
    public async start() {
        new TestTable();
    }
}

new Promise(async (res, rej) => {await new Main().start()})
```

`NOTE`: In all classes for working with the library, default values must be specified for each parameter, otherwise the annotations will not be able to read them. Additionally, the non-null assertion WILL NOT help.

### 📥 Connecting to the Database

`ModularORM` only works with MySQL, this is built into the library, so the database connection looks as follows:

```typescript
const database : ModularORM = ModularORM.getInstance; // Singleton pattern
await database.start({
    host: 'ur_host',
    user: 'ur_user',
    password: 'ur_password',
    database: 'ur_database_name',
    port: 3306 // Or any
});
```

`ModularORM` works with a connection pool, so there's no need to worry about closing the connection.

### 🏗️ Creating Database Queries

Query creation is done through the `QueryBuilder` class. It is a class that uses the Builder pattern.

Let's take a look at how to create an `INSERT` query with code examples!

```typescript
const builder : QueryBuilder = new QueryBuilder()
    .setTable(TestTable) // Specify the table type, which extends Module
    .setType(QueryType.INSERT) // Choose the appropriate query type from the enum
    .setInsert(
        // Create an instance of the InsertBuilder class
        // The boolean argument it accepts depends 
        // on whether you need to specify all the columns in the table
        // or only those that cannot be null or do not have auto-fill.
        // For example, if your table has an autoIncrement column,
        // specify true and DO NOT add it to the InsertBuilder.
        new InsertBuilder(true)
            .add('userId', '123') // The first argument is the column name, the second is the value.
    )

await builder.build().execute(); // The execute method executes the SQL query without returning a response.
```

Now, let's simplify the code by adding `ModuleAdapter` to our table:

```typescript
@Table
@NamedTable('ur_table_name')
class TestTable extends Module {
    
    @Column(DefaultColumn.AUTOINCREMENT_ID)
    public id : number = 0;
    
    @Column(DefaultColumn.VARCHAR_UUID)
    public userId : string = "";
    
    // U can use arrow-functions
    public static async create(values: { [key: string]: any }) : Promise<any> {
        await new ModelAdapter(Test).create(values);
    }
    
}
```

Now, adding records to the table will look like this:

```typescript
await TestTable.create({
    userId: '123'
})
```

Easy, right?)

### 📂 Creating SELECT Queries

To retrieve data from the database, you need to create a result class that extends `QueryResult`.

```typescript
class TestResult extends QueryResult {
    
    @Column('id') // // Specify this annotation for each parameter.
    public autoId : number = 0;

    // You can also omit specifying the column name explicitly
    // if it matches the parameter name.
    @Column()
    public userId : string = "";
    
}
```

Next, create the `QueryBuilder`:

```typescript
const builder : QueryBuilder = new QueryBuilder()
    .setTable(TestTable)
    .setType(QueryType.SELECT)
    .setSelect(
        new SelectBuilder() // Create the SelectBuilder
            // .addAll() if you want to select all columns (*)
            // You can also retrieve COUNT, SUM, and other values by giving them aliases:
            // .addCount('id', 'countId') where the first argument is the column name, 
            // and the second is the name of the returned result.
            // Or simply specify the column you want to retrieve:
            .addColumn('userId')
    )
    // Optionally, you can specify WHERE
    .setWhere(
        new WhereBuilder() // Create the WhereBuilder
            // The equalAnd method means that the following values
            // will be connected by AND. 
            // If you have only one comparison item,
            // it doesn't matter what you specify.
            // If you want to compare two values using OR,
            // add .equalOr.
            .equalAnd('columnName', 'value')
            // You can also add your own comparison operator:
            // .conditionAnd('columnName', 'condition (<, >, LIKE, IN and more)', 'value')
    )
    // You can add ORDER BY,
    .setDesc('columnName')
    // Set limit,
    .setLimit(1)
    // Add GROUP BY,
    .setGroup('columnName')
    // Add offset,
    .setOffset(20)
    // Also add having 
    .setHaving(
        new HavingBuilder()
            .and('column', 'operator (<, > and more)', 'value')
    )

// You can retrieve the values as an array of your QueryResult objects.
const results : TestResult[] = await builder.build().get(TestResult)
```

Using `ModuleAdapter`:

```typescript
@Table
@NamedTable('ur_table_name')
class TestTable extends Module {
    
    @Column(DefaultColumn.AUTOINCREMENT_ID)
    public id : number = 0;
    
    @Column(DefaultColumn.VARCHAR_UUID)
    public userId : string = "";
    
    // Or use arrow-functions
    public static async select(
        where: { [key: string] : any }, 
        params?: Partial<SelectQueryParams>
    ) : Promise<TestResult[]> { 
        return await new ModelAdapter(Test).select<TestResult>(TestResult, where, params)
    }
    
}

const results : TestResult[] = await TestTable.select({
    userId: 123 // Where userId = 123
}, {
    limit: 1 // LIMIT 1
})

```

### 📇 Creating Update Queries

Creating UPDATE queries is not much different from the others. Let's also look at an example with `QueryBuilder` and `ModelAdapter`.

```typescript
const builder : QueryBuilder = new QueryBuilder()
    .setTable(TestTable)
    .setType(QueryType.UPDATE)
    .setWhere(
        new WhereBuilder()
            .equalAnd('column', 'value')
    )
    .setUpdate(
        new UpdateBuilder() // Create UpdateBuilder
            .add('column', 'value') // SET column = value
    )

await build.build().execute() // Use #execute method
```

Using `ModuleAdapter`:

```typescript
@Table
@NamedTable('ur_table_name')
class TestTable extends Module {
    
    @Column(DefaultColumn.AUTOINCREMENT_ID)
    public id : number = 0;
    
    @Column(DefaultColumn.VARCHAR_UUID)
    public userId : string = "";
    
    // Or use arrow-functions
    public static async update(
        newValues: { [key: string] : any }, 
        where?: { [key: string] : any }
    ) : Promise<TestResult[]> { 
        return await new ModelAdapter(Test).update(newValues, where)
    }
    
}

// UPDATE ur_table_name SET userId = 124 WHERE userId = 123
await TestTable.update({
    userId: 124
}, {
    userId: 123
})
```

### 🪛 Other Queries

Creating queries of other types is not much different from the ones we have covered before. For example, to delete something from a table, you need to specify the `DELETE` query type in `QueryBuilder` and add `WhereBuilder`. To drop a table, simply specify the `DROP` type and the table to be deleted (don't forget to remove it from the code). Here's a list of all query types:

- INSERT
- SELECT
- DELETE
- DROP
- UPDATE
- TRUNCATE

**❓ Why is there no `ALTER` query?**

This type of query is not present in the library for two reasons. First, `ModularORM` supports automatic column updates when they do not match the database. This is done through the `Migration` annotation (we will discuss this later). Second, if you need to execute a query that cannot be sent through the library, you can send queries directly:

```typescript
await new DatabaseAPI().databaseSetQuery({
    sql: `ALTER TABLE ur_table_name ADD testColumn VARCHAR(32)`,
    params: [] // Values for escaping
})
```

### 🔄 Automatic Table Updates

As mentioned earlier, the library supports automatic table updates. Currently, only column updates are supported (adding them to the database and removing them accordingly). Let's assume you initially created a table and used it for a month:

```typescript
@Table
@NamedTable('api_keys')
export class ApiKeysModule extends Module {
    
    @Column(DefaultColumn.AUTOINCREMENT_ID)
    public id : number = 0;
    
    @Column(DefaultColumn.LONG_VARCHAR)
    public key : string = "";
    
    @Column(DefaultColumn.DATETIME)
    public expiresIn : Date = new Date();
    
    @Column(DefaultColumn.TEXT)
    public scopes : string = "";
    
}
```

But you needed to add another column:

```typescript
@Table
@NamedTable('api_keys')
export class ApiKeysModule extends Module {
    
    @Column(DefaultColumn.AUTOINCREMENT_ID)
    public id : number = 0;
    
    @Column(DefaultColumn.LONG_VARCHAR)
    public key : string = "";
    
    @Column(DefaultColumn.DATETIME)
    public expiresIn : Date = new Date();
    
    @Column(DefaultColumn.TEXT)
    public scopes : string = "";
    
    @Column(DefaultColumn.BOOL_DEFAULT_FALSE)
    public isBanned : boolean = false;
    
}
```

What should you do in this case? Manually add the column? No, you can add the `Migration` annotation, specifying `MigrationType.COLUMNS`:

```typescript
@Table
@NamedTable('api_keys')
@Migration(MigrationType.COLUMNS)
export class ApiKeysModule extends Module {
    
    @Column(DefaultColumn.AUTOINCREMENT_ID)
    public id : number = 0;
    
    @Column(DefaultColumn.LONG_VARCHAR)
    public key : string = "";
    
    @Column(DefaultColumn.DATETIME)
    public expiresIn : Date = new Date();
    
    @Column(DefaultColumn.TEXT)
    public scopes : string = "";
    
    @Column(DefaultColumn.BOOL_DEFAULT_FALSE)
    public isBanned : boolean = false;
    
}
```

Next time the application runs, ModularORM will notice that the columns in the Module do not match the columns in the database and will add them via `ALTER TABLE`. This also works in reverse: if you need to remove a column. We do not recommend using this all the time, as the process of adding missing columns is quite complex and takes some time during application startup.

### 💡 Default SQL Functions

`ModularORM` supports standard SQL functions. For example, if you need a `TIMESTAMP` column that will automatically update its value when modified, you can do it like this:

```typescript
@Table
@NamedTable('ur_table_name')
export class TestTable extends Module {
    
    @Column({
        type: ColumnType.TIMESTAMP,
        notNull: true,
        onUpdate: SqlFunctions.CURRENT_TIMESTAMP
    })
    public date : Date = new Date()
    
}
```

Thus, when records are updated, the affected columns will automatically update the date to the current time.

### 🔗 Information Schema

The library also supports working with `INFORMATION_SCHEMA.TABLES` and `INFORMATION_SCHEMA.COLUMNS`. Interaction with tables is done through the `InformationSchema` class, and with columns — through the `InformationSchemaColumns`.

```typescript
// If TABLE_SCHEMA and TABLE_NAME are provided, a ANALIZE TABLE query is automatically executed
const results : InformationSchemaResult[] = InformationSchema.select({
    TABLE_SCHEMA: `ur_database_name`,
    TABLE_NAME: `ur_table_name` // As string only
})

if (results.length < 1) return;
const nextAutoincrementID = results[0].autoIncrement;
```

### *️⃣ Custom Column Annotations

Today, we have already covered the `AutoIncrementId` annotation. It is a `column annotation`. However, you can also create your own annotations with custom behavior:

```typescript
export const BooleanColumn = ColumnAnnotationFabric.create({
    type: ColumnType.BOOLEAN,
    notNull: true
})
```

Or this:

```typescript
export const BooleanColumn = ColumnAnnotationFabric.create(DefaultColumn.BOOLEAN)
```

It is worth noting that if you create annotations as constants rather than functions (including arrow functions), you don't need to add parentheses when using them. However, if your annotation accepts a value (even an optional one), you must use it with parentheses after the name.

### 🏳️‍🌈 Transforms

These are annotations that allow you to modify the values of each column when they are defined and added to the query result. For example, if you want any value from the database to be converted to a string, you can do it like this:

```typescript
export class TestResult extends QueryResult {
    
    @Column()
    @Transform((value) => { // "value" is the value that comes from the database before being written to the class.
        return String(value)
    })
    public id : string = "";
    
}
```

In this example, we made it so that the ID field will always be a string, regardless of its representation in the database. And of course, you can create much more complex operations with the values.

### ♻️ Creating Custom Transforms

You can create predefined transformers without the need to copy and paste the same function each time.

```typescript
export const ToUnique = TransformFactory.createTransform(
    (value) => {
        return Symbol(value);
    }
)

class TestResult extends QueryResult {
    
    @Result()
    @ToUnique
    public id : symbol = Symbol(" ")
    
}
```

In this example, we created the `ToUnique` transformer, and now the id field will always have the type `Symbol`.

### ☑️ Validators

Validators allow you to check the output values in `QueryResult` classes. You can validate anything, from the type of the output value to its existence in other columns of the database, and much more. If the validation of a value fails, error messages will be stored in the `validateErrors` Set-array as strings. There is also a `Validate` interface that you can extend in the `QueryResult` class to avoid confusion with the name.

```typescript
class TestResult extends QueryResult implements Validate {
    
    @Result()
    @IsNumber // Checks that the value is a number.
    public id : number = 0;
    
    @Result()
    @IsInArray('123', '124', '125') // Checks if the value exists in the provided REST array.
    public userId : string = "";

    // For example, if id is not a number, an error message will appear here.
    public validateErrors : Set<string> = new Set();
    
}
```

It is also worth noting that the transformer is executed first, and only then the value is passed to the validator, so you can also validate values from the transformer.

### 📋 Validators list

Here you can see all the default validators and what they accept.

| Name             |      Params       |                                                                                                          Description                                                                                                           |                                                                  Error message                                                                   |
|:-----------------|:-----------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:------------------------------------------------------------------------------------------------------------------------------------------------:|
| @IsIntegerBased  |         -         |                                                                             Checks that the provided value is a number or can be converted to one.                                                                             |                                                              Must be a valid number                                                              |
| @IsBooleanBased  |         -         |                                                                            Checks that the provided value is a boolean or can be converted to one.                                                                             |                                                             Must be a boolean or 0/1                                                             |
| @IsAID           |         -         |                                                                              Checks that the value is a number and that it is greater than zero.                                                                               |                                                         Must be a number greater than 0                                                          |
| @IsString        |         -         |                                                                                                 Checks that value is a string                                                                                                  |                                                                 Must be a string                                                                 |
| @IsNumber        |         -         |                                                                                                 Checks that value is a number                                                                                                  |                                                                 Must be a number                                                                 |
| @IsBoolean       |         -         |                                                                                                 Checks that value is a boolean                                                                                                 |                                                                Must be a boolean                                                                 |
| @IsJSON          |         -         |                                                                                 Checks that the value is an object ({}), not an array or null.                                                                                 |                                                              Must be a JSON object                                                               |
| @IsUUID          |         -         |                                                                         Checks that value is a string and that length it is less than or equal to 64.                                                                          |                                                        Must be a string with length <= 64                                                        |
| @IsLongVarchar   |         -         |                                                                         Checks that value is a string and that length it is less than or equal to 255.                                                                         |                                                       Must be a string with length <= 255                                                        |
| @IsUserField     |         -         |                                                                         Checks that value is a string and that length it is less than or equal to 500.                                                                         |                                                       Must be a string with length <= 500'                                                       |
| @IsDate          |         -         |                                                                                               Checks that value is a Date object                                                                                               |                                                               Must be a valid Date                                                               |
| @IsInArray       | String REST array |                                                                                Checks that the value is in the array passed to the annotation.                                                                                 |                                                    Value must be one of [${args.join(', ')}]                                                     |
| @Min             |      number       |                                                       Checks that the number (or the length of the string, if a string is provided) is greater than the provided value.                                                        |                                                     Must be greater than or equal to ${min}                                                      |
| @Max             |      number       |                                                         Checks that the number (or the length of the string, if a string is provided) is less than the provided value.                                                         |                                                       Must be less than or equal to ${max}                                                       |
| @IsNotNull       |         -         |                                                                                          Checks that value is not null or undefined.                                                                                           |                                                          Must not be null or undefined                                                           |
| @IsNullable      |         -         |                                                                                            Checks that value is null or undefined.                                                                                             |                                                           Must be a null or undefined                                                            |
| @Equals          |        any        |                                                                                        Compares the value with the value passed to it.                                                                                         |                                                           Must be equal to ${checkVal}                                                           |
| @NotEquals       |        any        |                                                                                   Checks that the value is not equal to the provided value.                                                                                    |                                                         Must not be equal to ${checkVal}                                                         |
| @IsNotEmptyArray |         -         |                                                                                  Checks that the value is an array and that it is not empty.                                                                                   |                                                            Must be a non-empty array                                                             |
| @IsEmptyArray    |         -         |                                                                                    Checks that the value is an array and that it is empty.                                                                                     |                                                              Must be an empty array                                                              |
| @IsPositive      |         -         |                                                                                          Checks that the number is greater than zero.                                                                                          |                                                            Must be a positive number                                                             |
| @IsNegative      |         -         |                                                                                             Checks that the number is less than 1.                                                                                             |                                                            Must be a negative number                                                             |
| @IsArray         |         -         |                                                                                                  Checks that value is a array                                                                                                  |                                                                 Must be an array                                                                 |
| @IsSafeString    |         -         | Checks that value is a string and that it contains only allowed characters: `A-Z` `a-z` `А-Я` `а-я` `0-9` `!` `@` `#` `$` `%` `^` `&` `*` `(` `)` `_` `+` `=` `[` `]` `{` `}` `\|` `;` `:` `'` `"` `,` `.` `<` `>` `?` `\` `/` | String contains invalid characters. Allowed characters: English and Russian letters, digits, and safe symbols (!@#$%^&*()_+=[]{}\|;:'",.<>?/\-). |

### 🛡️ Custom Validators

Of course, you can create your own validators. To do this, use the `ValidatorFabric` class and the static method `createValidator`. This method takes a function and a string. During validation, the function receives two parameters: the value and the parameter name in the `QueryResult`. The function should return a `boolean`, where `true` means the validation passed successfully, and `false` means the validation failed and an error should be thrown. The string passed to the method is the error message.

```typescript
export const IsValidCustomClass = ValidatorFactory.createValidator(
    (value: any, column: string): boolean => {
        console.log(`Validate ${value} from ${column}`);
        return CustomClass.isValid(value);
    }, 'Must be a valid CustomClass'
)
```

### 📡 Events

When creating a database query using the library, ModularORM generates events that you can handle directly in the methods of your `Module`. This can be done using the `EventHandler` annotation, which creates routing to your method. When an event is triggered, the `QueryHandler` interface will be passed to your method. Events *(like any other user-defined functions supported by the library)* can be asynchronous.

```typescript
@Table
@NamedTable('ur_table_name')
class TestTable extends Module {

    @Column(DefaultColumn.AUTOINCREMENT_ID)
    public someParam: number = 0;

    @EventHandler
    public logger(params: QueryHandler): void {
        // type is QueryType
        console.log(`Query type: ${params.type}`)
        // table is string
        console.log(`In table: ${params.table}`)
        // sql is string
        console.log(`SQL query: ${params.sql}`)
        // params is any[]
        console.log(`With params: ${params.params}`)
    }

    public static async select(
        where: { [key: string] : any },
        params?: Partial<SelectQueryParams>
    ) : Promise<SomeResults[]> {
        return await new ModelAdapter(Test).select<SomeResults>(TestResult, where, params)
    }
    
}

// Query type: QueryType.SELECT
// In table: ur_table_name
// SQL query: SELECT * FROM ur_table_name
// With params: []
await TestTable.select({}) // where must be empty

// Query type: QueryType.SELECT
// In table: ur_table_name
// SQL query: SELECT * FROM ur_table_name WHERE someParam = ?
// With params: [123]
await TestTable.select({
    someParam: 123
})
```

### 🎨 Default Columns

Below is a list of all elements of `DefaultColumn`.

| NAME               |                 DESCRIPTION                 |
|:-------------------|:-------------------------------------------:|
| AUTOINCREMENT_ID   | INTEGER AUTO_INCREMENT PRIMARY KEY NOT NULL |
| VARCHAR_UUID       |         VARCHAR(64) NOT NULL UNIQUE         |
| TIME               |              DATETIME NOT NULL              |
| BOOLEAN            |              BOOLEAN NOT NULL               |
| BOOL_DEFAULT_TRUE  |       BOOLEAN NOT NULL DEFAULT(true)        |
| BOOL_DEFAULT_FALSE |       BOOLEAN NOT NULL DEFAULT(false)       |
| INTEGER            |              INTEGER NOT NULL               |
| LONG_VARCHAR       |            VARCHAR(255) NOT NULL            |
| TEXT               |                TEXT NOT NULL                |
| JSON               |                JSON NOT NULL                |
