<p align="center">
<img src="./images/modularorm.png" alt="ModularORM Logo" width="200" />
</p>

<p align="center">
Легкая, полностью объектно-ориентированная ORM-библиотека для TypeScript и MySQL. Она была разработана для простоты и мощной типо-безопасности, с API, основанных на классах и встроенных декораторах.
</p>

<p align="center">
<img src="https://github.com/KoP3YkA/ModularORM/actions/workflows/tests.yml/badge.svg" alt="Test Badge" />
  <a href="https://badge.fury.io/js/modular-orm">
    <img src="https://badge.fury.io/js/modular-orm.svg" alt="npm version" />
  </a>

</p>

---

| Описание                             | Результат |
|--------------------------------------|:---------:|
| Отправка 100.000 INSERT запросов     |    13с    |
| Получение 100.000 строк с DTO        |   79мс    |
| Строчек кода, нужных для подключения |     7     |
| Coverage тестов                      |  66.82%   |
| Размер dist-а                        |   340кб   |

---

## Функции
- Полностью объектно-ориентированная структура: Создания таблиц, строк и связей используя TypeScript классы.

- Минимальная настройка: Простая конфигурация и старт при помощи пары строчек кода.

- Up и down миграции в файлах (или автоматическая синхронизация без файлов)

- DTO на основе классов: Кастомные DTO для результатов запросов при помощи `@Result()` декоратора.

- Repository паттерн: Создание репозитоериев `new Repository(Class)` - не требуется никаких дополнительных регистраций.

- Валидация и трансформеры: Логика валидаторов и трансформеров при помощи встроенных (или ваших собственных) декораторов

- Логгер: вы можете добавить специальный метод в класс-модуль, который будет вызываться при каждом запросе

- Интуитивно понятная архитектура: `repository.find({ userId: [1, 2] })` - достать все строки из вашей таблицы, где userId равен 1 или 2

- Кэширование: встроенный in-memory кэш без `Redis` и гибкая настройка

- Встроенная поддержка Information Schema: Вы можете использовать уже готовые классы для работы с Information schema

И много чего еще. Вы можете посмотреть примере в [репозитории GitHub](https://github.com/KoP3YkA/ModularORM/tree/main/example)

ModularORM - идеальная библиотека для разработчиков, кто хочет чистую архитектуру, типо-безопасность с полным контролем и минимальным оверхедом.

## Примеры

[Полная документация](https://github.com/KoP3YkA/ModularORM/wiki)

Подключение к базе данных
```typescript
const main : ModularORM = ModularORM.getInstance()
await main.start({
    host: 'localhost',
    user: 'root',
    password: '1',
    database: 'orm',
    port: 3306,
    connectionType: 'pool',
    checkTablesExists: false, // Если вы хотите проверить, существует ли уже такая таблица. Если выключено, будет выполнен IF NOT EXISTS
    validationErrors: false // Если включено, ошибки валидации будут выбрасывать реальные исключения в рантайме
    // И ооочень много настроек
})
```

Создание таблиц
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

Создание DTO с трансформерами и валидаторами
```typescript
class UserDTO implements Validate {

    @Result() // Может быть пустым
    public id!: number;

    @Result('first_name')
    @IsSafeString() // Валидатор
    public firstName!: string;

    @Result('last_name')
    @IsSafeString() // Валидатор
    public lastName!: string;

    @Result()
    @ToNumber() // Трансформер
    public money!: number;

    public validateErrors: Set<string> = new Set(); // Ошибки валидации

}
```

Создание репозитория
```typescript
const repo = new Repository(Users, UserDTO); // С DTO
const repotwo = new Repository(Users); // Без DTO
```

Запросы
```typescript
// SELECT * FROM users WHERE first_name = "Alex" OR last_name = "Smith"
const res : Users[] = await repotwo.find({ first_name: ["Alex"], last_name: "Smith" })
// SELECT * FROM users WHERE (id = 1 OR id = 2) ORDER BY id DESC LIMIT 1
const restwo : UserDTO[] = await repo.find({ id: [1, 2] }, { limit: 1, order: { id: "DESC" } })
```