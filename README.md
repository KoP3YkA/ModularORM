## ModularORM

![Test](https://github.com/KoP3YkA/ModularORM/actions/workflows/tests.yml/badge.svg)
[![npm version](https://badge.fury.io/js/modular-orm.svg)](https://badge.fury.io/js/modular-orm)

`ModularORM` is a lightweight, fully object-oriented ORM library for TypeScript and MySQL. It is designed for simplicity and strong type safety, with a class-based API built around decorators.
Key Features

- Fully OOP Structure: Define tables, columns, and relationships using TypeScript classes.

- Minimal Setup: Simple to configure and get started with-just a few lines of code.

- Strongly-Typed Query Builder: Build `SELECT`, `INSERT`, `UPDATE`, and custom queries with full TypeScript inference and IntelliSense support.

- Class-Based DTO Mapping: Map query results to custom classes using `@Result()` decorators.

- Repository Pattern Out of the Box: Create repositories with `new Repository(Class)` - no boilerplate or registration needed.

- Custom Decorators and Column Types: Easily define and reuse your own decorators, types, and transforms.

- Built-in SQL Functions and Expressions: Use helpers like `UUID()`, `CURRENT_TIMESTAMP`, or write your own SQL snippets with type safety.

- Validation and Transforms: Add validation and data transformation logic directly to your models with built-in or custom tools.

- Simple Migration Support: Perform basic migrations with clear and structured tools.

- Typed Information Schema Access: Query database metadata through typed APIs.

And more. You can see examples in [GitHub repository](https://github.com/KoP3YkA/ModularORM/tree/main/example)

ModularORM is ideal for developers who want a clean, type-safe ORM experience with full control and minimal overhead.

## [Documentation](https://github.com/KoP3YkA/ModularORM/wiki)