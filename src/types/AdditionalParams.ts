import {Module} from "../classes/abstract/Module";
import {SelectQueryParams} from "../interfaces/SelectQueryParams";

export type AdditionalParams<T extends Module> = Partial<SelectQueryParams<T>>;