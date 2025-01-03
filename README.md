# ModularORM

ModularORM is a powerful and flexible Object-Relational Mapping (ORM) library for TypeScript that allows developers to interact with SQL databases through TypeScript classes. The library abstracts the complexity of SQL queries while offering a rich and extensible API for building complex queries with ease.

## Features

<ul>
  <li><strong>Dynamic Query Builder:</strong> Build and execute SQL queries dynamically with classes like <code>InsertBuilder</code>, <code>UpdateBuilder</code>, <code>SelectBuilder</code>, and more.</li>
  <li><strong>Table Mapping:</strong> Easily map TypeScript classes to database tables using decorators like <code>@Table</code> and <code>@Column</code>.</li>
  <li><strong>Column Types:</strong> Use predefined column types (e.g., <code>ColumnType.INTEGER</code>, <code>ColumnType.VARCHAR</code>) or extend them as needed.</li>
  <li><strong>Custom SQL Functions:</strong> Includes predefined functions like <code>CURRENT_TIMESTAMP</code>, <code>UUID()</code>, and <code>RAND()</code>. Create complex SQL expressions with <code>SqlFunctions</code>.</li>
  <li><strong>Query Results Mapping:</strong> Automatically map query results to TypeScript class instances with <code>@Result</code> decorator.</li>
  <li><strong>Advanced Error Handling:</strong> Comprehensive error management integrated throughout the library.</li>
</ul>

## [Documentation](https://kop3yka.github.io/ModularORM/)
