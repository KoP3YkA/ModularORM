//########################################
// Courses table definition
//########################################
import {
    AutoIncrementId,
    Column,
    ColumnType,
    ManyToMany,
    ModularORM,
    Module,
    NamedTable,
    Repository,
    Table
} from "../src";

@Table({ comment: "Courses table" })
@NamedTable("courses")
class Courses extends Module {
    @AutoIncrementId()
    public id!: number;

    @Column({
        type: ColumnType.VARCHAR(128),
        notNull: true,
        comment: "Course title",
        index: true,
    })
    public title!: string;

    @ManyToMany(() => Students, (student) => student.courses)
    public students!: Students[];

}

//########################################
// Students table definition
//########################################
@Table({ comment: "Students table" })
@NamedTable("students")
class Students extends Module {
    @AutoIncrementId()
    public id!: number;

    @Column({
        type: ColumnType.VARCHAR(64),
        notNull: true,
        comment: "Student name",
        index: true,
    })
    public name!: string;

    @ManyToMany(() => Courses, (course) => course.students)
    public courses!: Courses[];
}

(async () => {
    const orm = ModularORM.getInstance();
    await orm.start({
        host: "localhost",
        user: "root",
        password: "1",
        database: "orm",
        port: 3306,
        connectionType: "pool",
        checkTablesExists: false,
        validationErrors: false,
    });

    const studentsRepo = new Repository(Students);
    const coursesRepo = new Repository(Courses);

    // Clean up previous data and relations
    await studentsRepo.deleteAllManyToManyRelations("courses");
    await studentsRepo.deleteAll();
    await coursesRepo.deleteAll();

    // Insert some courses
    await coursesRepo.insert({ title: "Programming" });
    await coursesRepo.insert({ title: "Cooking" });

    // Create course instances for linking
    const programming = new Courses();
    programming.id = 1;
    const cooking = new Courses();
    cooking.id = 2;

    // Insert students with many-to-many relations to courses
    await studentsRepo.insert({ name: "Maxim", courses: [programming] });
    await studentsRepo.insert({ name: "Alice", courses: [programming, cooking] });
    await studentsRepo.insert({ name: "Bob" }); // no courses

    // Fetch courses with related students
    const coursesWithStudents = await coursesRepo.find({}, { relations: [Students] });
    console.log("Courses with students:", JSON.stringify(coursesWithStudents, null, 2));

    // Fetch student with their courses
    const alice = await studentsRepo.findOne({ name: "Alice" }, { relations: [Courses] });
    console.log("Alice with courses:", JSON.stringify(alice, null, 2));

    // Update student — remove all courses from Bob
    const bob = await studentsRepo.findOne({ name: "Bob" }, { relations: [Courses] });
    if (bob) {
        bob.courses = [];
        await studentsRepo.save(bob);
        console.log("Bob after removing courses:", JSON.stringify(bob, null, 2));
    }

    // Delete a student and check updated relations
    await studentsRepo.delete({ name: "Maxim" });
    const updatedProgramming = await coursesRepo.findOne({ id: 1 }, { relations: [Students] });
    console.log("Programming course after deleting Maxim:", JSON.stringify(updatedProgramming, null, 2));
})();