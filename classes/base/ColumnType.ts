import {BaseEnumClass} from "../abstract/BaseEnumClass";

export class ColumnType extends BaseEnumClass {

    public static TEXT : ColumnType = new ColumnType('TEXT');
    /**
     * Count of symbols (N = VARCHAR(N) )
     * @param symbols
     */
    public static VARCHAR = (symbols: number) => new ColumnType(`VARCHAR(${symbols})`)
    public static INTEGER : ColumnType = new ColumnType('INTEGER');
    public static DATETIME : ColumnType = new ColumnType('DATETIME');
    public static TIMESTAMP : ColumnType = new ColumnType('TIMESTAMP');
    public static DATE : ColumnType = new ColumnType('DATE');

    // -------------------------------------------------------

    public constructor(
        public type : string,
    ) {super();}

}