import {AutoIncrementId, Column, ColumnType, ManyToOne, Module, NamedTable, Result, Table} from '../../src'
import {Members} from "./Members";

@Table()
@NamedTable('ranks')
export class Ranks extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(64) })
    public name!: string;

    @Column({ type: ColumnType.INTEGER })
    public weight!: number;

    @ManyToOne(() => Members, (member) => member.ranks)
    public member_id!: number;

}

export class RankDTO {

    @Result('id')
    public rankId!: number;

    @Result('name')
    public title!: string;

    @Result('weight')
    public position!: number;

    @Result('member_id')
    public memberId!: number;

}