import {ValidatorFactory} from "./factory/ValidatorFactory";

/**
 * Validator that checks if a value is a number or can be converted to a number.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a number or can be converted to a number.
 */
export const IsIntegerBased = ValidatorFactory.createValidator((value: any) => {
    return typeof value === 'number' || !isNaN(+value)
}, 'Must be a valid number')

/**
 * Validator that checks if a value is a boolean or a numeric value representing a boolean (0 or 1).
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a boolean or 0/1.
 */
export const IsBooleanBased = ValidatorFactory.createValidator((value: any) => {
    return typeof value === 'boolean' || (!isNaN(value) && (+value === 1 || +value === 0))
}, 'Must be a boolean or 0/1')

/**
 * Validator that checks if a value is a positive number (greater than 0).
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a positive number.
 */
export const IsAID = ValidatorFactory.createValidator((value: any) : boolean => {
    return (typeof value === 'number' || !isNaN(+value)) && +value > 0;
}, 'Must be a number greater than 0')

/**
 * Validator that checks if a value is a string.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a string.
 */
export const IsString = ValidatorFactory.createValidator((value: any) => {
    return typeof value === 'string';
}, 'Must be a string')

/**
 * Validator that checks if a value is a number.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a number.
 */
export const IsNumber = ValidatorFactory.createValidator((value: any) => {
    return typeof value === 'number';
}, 'Must be a number')

/**
 * Validator that checks if a value is a boolean.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a boolean.
 */
export const IsBoolean = ValidatorFactory.createValidator((value: any) => {
    return typeof value === 'boolean';
}, 'Must be a boolean')

/**
 * Validator that checks if a value is a plain JSON object (not an array).
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a plain object (not an array).
 */
export const IsJSON = ValidatorFactory.createValidator((value: any) => {
    return typeof value === 'object' && value !== null && value.constructor === Object && !Array.isArray(value);
}, 'Must be a JSON object')

/**
 * Validator that checks if a value is a string with a length of at most 64 characters.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a string with length <= 64.
 */
export const IsUUID = ValidatorFactory.createValidator((value) => {
    return typeof value === 'string' && value.length <= 64;
}, 'Must be a string with length <= 64')

/**
 * Validator that checks if a value is a string with a length of at most 255 characters.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a string with length <= 255.
 */
export const IsLongVarchar = ValidatorFactory.createValidator((value) => {
    return typeof value === 'string' && value.length <= 255;
}, 'Must be a string with length <= 255')

/**
 * Validator that checks if a value is a string with a length of at most 500 characters.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a string with length <= 500.
 */
export const IsUserField = ValidatorFactory.createValidator((value) => {
    return typeof value === 'string' && value.length <= 500
}, 'Must be a string with length <= 500')

/**
 * Validator that checks if a value is a valid Date object.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a valid Date object.
 */
export const IsDate = ValidatorFactory.createValidator((value) => {
    return value instanceof Date;
}, 'Must be a valid Date')

/**
 * Validator that checks if a value is within the specified set of values.
 * @param {...string} args - The valid values to check against.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is included in the specified values.
 */
export const IsInArray = (...args: string[]) => ValidatorFactory.createValidator((value) => {
    return args.includes(value);
}, `Value must be one of [${args.join(', ')}]`)

/**
 * Validator that checks if a value is less than or equal to a specified maximum value.
 * @param {number} max - The maximum allowed value.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is less than or equal to the maximum.
 */
export const Max = (max: number) => ValidatorFactory.createValidator((value: any) => {
    let length : number;

    if (typeof value === 'string') length = value.length;
    else if (typeof value === 'number') length = value;
    else return true;

    if (length > max) return false;

    return false;
}, `Must be less than or equal to ${max}`)

/**
 * Validator that checks if a value is greater than or equal to a specified minimum value.
 * @param {number} min - The minimum allowed value.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is greater than or equal to the minimum.
 */
export const Min = (min: number) => ValidatorFactory.createValidator((value: any) => {
    let length : number;

    if (typeof value === 'string') length = value.length;
    else if (typeof value === 'number') length = value;
    else return true;

    if (length < min) return false;

    return false;
}, `Must be greater than or equal to ${min}`)

/**
 * Validator that checks if a value is not null or undefined.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is neither null nor undefined.
 */
export const IsNotNull = ValidatorFactory.createValidator((value) => {
    return value !== null && value !== undefined
}, 'Must not be null or undefined')

/**
 * Validator that checks if a value is either null or undefined.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is null or undefined.
 */
export const IsNullable = ValidatorFactory.createValidator((value) => {
    return value === null || value === undefined
}, 'Must be a null or undefined')

/**
 * Validator that checks if a value is equal to a specified value.
 * @param {any} checkVal - The value to compare against.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is equal to the specified value.
 */
export const Equals = (checkVal: any) => ValidatorFactory.createValidator((value) => {
    return value == checkVal;
}, `Must be equal to ${checkVal}`)

/**
 * Validator that checks if a value is not equal to a specified value.
 * @param {any} checkVal - The value to compare against.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is not equal to the specified value.
 */
export const NotEquals = (checkVal: any) => ValidatorFactory.createValidator((value) => {
    return value != checkVal;
}, `Must not be equal to ${checkVal}`)

/**
 * Validator that checks if a value is a non-empty array.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a non-empty array.
 */
export const IsNotEmptyArray = ValidatorFactory.createValidator((value) => {
    if (!Array.isArray(value)) return true;
    return Array.length > 0;
}, 'Must be a non-empty array')

/**
 * Validator that checks if a value is an empty array.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is an empty array.
 */
export const IsEmptyArray = ValidatorFactory.createValidator((value) => {
    if (!Array.isArray(value)) return true;
    return Array.length === 0;
}, 'Must be an empty array')

/**
 * Validator that checks if a value is a positive number (greater than 0).
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a positive number.
 */
export const IsPositive = ValidatorFactory.createValidator((value) => {
    if (typeof value !== 'number') return true;
    return value > 0;
}, 'Must be a positive number')

/**
 * Validator that checks if a value is a negative number (less than 1).
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a negative number.
 */
export const IsNegative = ValidatorFactory.createValidator((value) => {
    if (typeof value !== 'number') return true;
    return value < 1;
}, 'Must be a negative number')

/**
 * Validator that checks if a value is an array.
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the value is an array.
 */
export const IsArray = ValidatorFactory.createValidator((value) => {
    return Array.isArray(value)
}, 'Must be an array')

/**
 * Validator that checks if a string contains only safe characters (English, Russian letters, digits, and certain symbols).
 * @param {any} value - The value to validate.
 * @returns {boolean} - Returns true if the string only contains allowed characters.
 */
export const IsSafeString = ValidatorFactory.createValidator((value) => {
    if (typeof value !== 'string') return true;
    const validPattern = /^[A-Za-zА-Яа-я0-9!@#$%^&*()_+=[\]{}|;:'",.<>?/\\-]*$/;
    return validPattern.test(value);
}, 'String contains invalid characters. Allowed characters: English and Russian letters, digits, and safe symbols (!@#$%^&*()_+=[\]{}|;:\'",.<>?/\\-).');



