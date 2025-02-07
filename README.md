## ModularORM

ModularORM is a powerful and flexible Object-Relational Mapping (ORM) library for TypeScript that allows developers to interact with SQL databases through TypeScript classes. The library abstracts the complexity of SQL queries while offering a rich and extensible API for building complex queries with ease.

### Features

- **Dynamic Query Builder:** Build and execute SQL queries dynamically with classes like ``InsertBuilder``, ``UpdateBuilder``, ``SelectBuilder``, and more.
- **Table Mapping:** Easily map TypeScript classes to database tables using decorators like ``@Table`` and ``@Column``.
- **Column Types:** Use predefined column types (e.g., ``ColumnType.INTEGER``, ``ColumnType.VARCHAR(number)``) or extend them as needed.
- **Custom SQL Functions:** Includes predefined functions like ``CURRENT_TIMESTAMP``, ``UUID()``, and ``RAND()``. Create complex SQL expressions with ``SqlFunctions``.
- **Query Results Mapping:** Automatically map query results to TypeScript class instances with ``@Result`` decorator.
- **Advanced Error Handling:** Comprehensive error management integrated throughout the library.