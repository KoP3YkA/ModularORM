/**
 * Copyright 2025 Artemy Vanchugov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// ---------- MAIN ----------
export * from './modularorm';

// ---------- ABSTRACT CLASSES ----------
export * from './classes/abstract/Database';
export * from './classes/abstract/Module';

// ---------- BASE CLASSES ----------
export * from './classes/base/ColumnType';
export * from './classes/base/DatabaseAPI';
export * from './classes/base/Errors';
export * from './classes/base/FinalQuery';
export * from './classes/base/HavingBuilder';
export * from './classes/base/InsertBuilder';
export * from './classes/base/QueryBuilder';
export * from './classes/base/QueryResult';
export * from './classes/base/QueryType';
export * from './classes/base/SelectBuilder';
export * from './classes/base/SqlFunctions';
export * from './classes/base/SQLQueryBuilder';
export * from './classes/base/UpdateBuilder';
export * from './classes/base/WhereBuilder';
export * from './classes/common/InformationSchemaColumns'
export * from './classes/base/Repository'
export * from './classes/base/JoinBuilder'

// ---------- ADAPTERS ----------
export * from './classes/adapter/ModelAdapter'

// ---------- COMMON ----------
export { InformationSchema, InformationSchemaResult } from './classes/common/InformationSchema'

// ---------- DECORATORS ----------
export * from './decorators/Column';
export * from './decorators/Result';
export * from './decorators/Table';
export * from './decorators/NamedTable';
export * from './decorators/EventHandler';
export * from './decorators/validators/factory/ValidatorFactory'
export * from './decorators/validators/Validators'
export * from './decorators/dto/Transform'
export * from './decorators/dto/TransformFactory'
export * from './decorators/Migration'
export * from './decorators/default/AutoIncrementId'
export * from './decorators/default/ColumnAnnotationFabric'
export * from './decorators/transforms/DefaultTransforms'
export * from './decorators/JoinTable'
export * from './decorators/ManyToMany'
export * from './decorators/ManyToOne'
export * from './decorators/OneToMany'
export * from './decorators/RenamedColumn'
export * from './decorators/SoftDeleteColumn'

// ---------- INTERFACES ----------
export * from './interfaces/ColumnParams';
export * from './interfaces/DatabaseParams';
export * from './interfaces/Query';
export * from './interfaces/SelectQueryParams'
export * from './interfaces/Validate'
export * from './interfaces/StartParams'
export * from './interfaces/TableCreateParams'

// ---------- TYPES ----------
export * from './types/QueryHandler'
export * from './types/Charset'
export * from './types/Collation'
export * from './types/AdditionalParams'
export * from './types/JoinType'
export * from './types/LoadingType'
export * from './types/ManyToManyKeys'
export * from './types/TableFieldBlock'
export * from './types/WhereBlock'

// ---------- NAMESPACES ----------
export * from './namespaces/DefaultColumn'

// ---------- ENUMS ----------
export * from './enums/QueryExecuteType'