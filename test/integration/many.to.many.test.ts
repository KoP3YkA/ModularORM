import {QueryBuilder, Repository} from "../../src";
import {Students} from "../setup/Students";
import {Courses} from "../setup/Courses";
import {setupOrm} from "../setup.orm";

const studentsRepository = new Repository(Students);
const coursesRepository = new Repository(Courses);

beforeAll(async () => {
    await setupOrm()
})

describe('Many to many relations', () => {
    test('Adding rows', async () => {
        await studentsRepository.deleteAllManyToManyRelations('courses')
        await studentsRepository.deleteAll();
        await coursesRepository.deleteAll();
        await coursesRepository.insert({ title: 'Programming' })

        const course = new Courses()
        course.id = 1;

        await studentsRepository.insert({ name: 'Maxim', courses: [course] })

        const results = await coursesRepository.find({}, { relations: [Students], depth: 2 });

        expect(results.length).toBe(1);

        if (results.length !== 0) expect(results[0].students.length).toBe(1)

        await studentsRepository.insert({ name: 'Alice', courses: [course] });
        await studentsRepository.insert({ name: 'Anastasiya' });

        const aliceFound = await studentsRepository.findOne({ name: 'Alice' }, { relations: [Courses] })

        expect(aliceFound).not.toBeNull();

        if (aliceFound) expect(aliceFound.courses.length).toBe(1)

        const courseResult = await coursesRepository.find({}, { relations: [Students] });

        expect(courseResult.length).toBe(1)

        if (courseResult.length !== 0) expect(courseResult[0].students.length).toBe(2)
    })

    test('Deleting rows', async () => {
        await studentsRepository.deleteAllManyToManyRelations('courses')
        await studentsRepository.deleteAll();
        await coursesRepository.deleteAll();
        await coursesRepository.insert({ title: 'Cooking' })
        await coursesRepository.insert({ title: 'Hobby horsing' })

        const cooking = new Courses();
        cooking.id = 1;

        const hobbyHorsing = new Courses();
        hobbyHorsing.id = 2;

        await studentsRepository.insert({ name: 'Polina' })
        await studentsRepository.insert({ name: 'Adolf' })
        await studentsRepository.insert({ name: 'Magomed', courses: [hobbyHorsing] })

        const cookingCourseResults = await coursesRepository.findOne(cooking, { relations: [Students] });
        const hobbyCourseResults = await coursesRepository.findOne(hobbyHorsing, { relations: [Students] });

        const polina = await studentsRepository.findOne({ name: 'Polina' }, { relations: [Courses] })
        const magomed = await studentsRepository.findOne({ name: 'Magomed' }, { relations: [Courses] })

        expect(cookingCourseResults).not.toBeNull();
        expect(hobbyCourseResults).not.toBeNull();
        expect(polina).not.toBeNull();
        expect(magomed).not.toBeNull()

        if (polina) expect(polina.courses.length).toBe(0)
        if (magomed) expect(magomed.courses.length).toBe(1)
        if (cookingCourseResults) expect(cookingCourseResults.students.length).toBe(0)
        if (hobbyCourseResults) expect(hobbyCourseResults.students.length).toBe(1)

        await studentsRepository.delete({ name: 'Magomed' })

        if (hobbyCourseResults) {
            await coursesRepository.updateInstance(hobbyCourseResults, { relations: [Students] });

            expect(hobbyCourseResults.students.length).toBe(0)
        }
    })

    test('Updating rows', async () => {
        await studentsRepository.deleteAllManyToManyRelations('courses')
        await studentsRepository.deleteAll();
        await coursesRepository.deleteAll();
        await coursesRepository.insert({ title: 'Painting' })

        const course = new Courses();
        course.id = 1;

        await studentsRepository.insert({ name: 'Jorge', courses: [course] });

        let results = await coursesRepository.findOne({}, { relations: [Students] });
        if (!results) throw new Error('Courses is null');

        expect(results.students.length).toBe(1)

        await coursesRepository.update({ title: 'Painting #2' }, { title: 'Painting' });
        await coursesRepository.updateInstance(results, { relations: [Students] });

        expect(results.students.length).toBe(1)

        await coursesRepository.update({ title: 'Painting', students: [] }, { title: 'Painting #2' });
        await coursesRepository.updateInstance(results);

        expect(results.students.length).toBe(0)
    })
})