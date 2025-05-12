export class QueryIs {

    public static NULL : QueryIs = new QueryIs('IS NULL');
    public static NOT_NULL : QueryIs = new QueryIs('IS NOT NULL');

    public constructor(public tag: string) {}

}