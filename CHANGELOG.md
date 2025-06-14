# Updates

## 0.3.0 | 26.05.2025

- [!] @Migration is deprecated
- [!] ModularORM#getInstance now is not GET
- [+] WhereBlock, TableFieldBlock, JoinType and more types
- [+] (Beta) JoinBuilder and QueryBuilder#setJoin
- [+] (Beta) Ability to write OR conditions directly in Repository using arrays
- [+] (Beta) @SoftDeleteColumn decorator
- [+] findOrFail, findOneByAutoincrementKey, findByAutoincrementKey, clone, softFindOne, softFind, softDelete methods in Repository
- [+] AdditionalParams interface
- [+] (Beta) ManyToOne, OneToMany, ManyToMany relations
- [+] (Beta) Down migrations
- [+] New column types
- [+] New settings in ModularORM#start
- [+] Advanced exceptions system
- [/] Fix some migration bugs
- [/] Migrations are now done via options when creating @Table, rather than a separate decorator

## 0.3.3 | 14.06.2025

- [+] Added type TableFieldStrings
- [+] Added exception description while creating the table
- [/] Improved Repository#clone method. Before: SELECT and INSERT queries. Now: INSERT INTO ... SELECT ... in one query