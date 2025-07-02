import {AutoIncrementId, Column, ColumnType, Module, NamedTable, OneToMany, Result, Table, ToNumber} from '../../src'
import {RankDTO, Ranks} from "./Ranks";

@Table({ priority: 1001 })
@NamedTable('members')
export class Members extends Module {

    @AutoIncrementId()
    public id!: number;

    @Column({ type: ColumnType.VARCHAR(64) })
    public apiId!: string;

}

export class MemberDTO {

    @Result('id')
    public memberId!: number;

    @Result('apiId')
    @ToNumber()
    public databaseId!: number;

    @OneToMany(() => Ranks, (rank) => rank.member_id, { result: () => RankDTO })
    public ranks!: RankDTO[]

}