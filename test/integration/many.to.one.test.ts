import {Repository} from "../../src";
import {MemberDTO, Members} from "../setup/Members";
import {RankDTO, Ranks} from "../setup/Ranks";
import {describe} from "node:test";
import {setupOrm} from "../setup.orm";
import {Posts} from "../setup/Posts";
import {Comments} from "../setup/Comments";

const membersRepository = new Repository(Members);
const dtoMembersRepository = new Repository(Members, MemberDTO);
const ranksRepository = new Repository(Ranks);
const dtoRanksRepository = new Repository(Ranks, RankDTO);
const postsRepository = new Repository(Posts)
const commentsRepository = new Repository(Comments)

beforeAll(async () => {
    await setupOrm()
})

beforeEach(async () => {
    await ranksRepository.deleteAll();
    await membersRepository.deleteAll();
    await commentsRepository.deleteAll();
    await postsRepository.deleteAll();
})

describe('ManyToOne and OneToMany relations', () => {
    test('Insert, select and delete with DTO', async () => {
        await membersRepository.insert({ apiId: '2' });
        await ranksRepository.insert({ name: 'Helper', weight: 1, member_id: 1 });
        await ranksRepository.insert({ name: 'Moderator', weight: 2, member_id: 1 });

        const results = await dtoMembersRepository.findOne({}, { relations: [Ranks] });
        if (!results) throw new Error('Results is null')

        expect(results.ranks.length).toBe(2);
        expect(results.ranks[0]).toBeInstanceOf(RankDTO);

        await ranksRepository.delete({ weight: 1 })
        await dtoMembersRepository.updateInstance(results, { relations: [Ranks] });

        expect(results.ranks.length).toBe(1)
    })

    test('Insert, select and delete without DTO', async () => {
        await postsRepository.insert({ title: 'Look at this city!' });
        await commentsRepository.insert({ content: 'Very nice', author_id: 1 });
        await commentsRepository.insert({ content: 'Cool!', author_id: 1 });

        const results = await postsRepository.findOne({}, { relations: [Comments] });
        if (!results) throw new Error('Results is null')

        expect(results.comments.length).toBe(2);
        expect(results.comments[0]).toBeInstanceOf(Comments);

        await commentsRepository.delete({ id: 2 })
        await postsRepository.updateInstance(results, { relations: [Comments] });

        expect(results.comments.length).toBe(1)
    })
})