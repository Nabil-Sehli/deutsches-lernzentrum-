import { eq } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { users, centers, inviteCodes, lessons, questions, quizAttempts } from "./schema";
import { hashPassword } from "../api/lib/password";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  await db.delete(quizAttempts);
  await db.delete(questions);
  await db.delete(lessons);
  await db.delete(inviteCodes);
  await db.delete(centers);
  await db.delete(users);

  const pwd = await hashPassword("password123");

  await db.insert(users).values([
    {
      email: "admin@example.com",
      passwordHash: pwd,
      name: "Admin User",
      role: "admin",
      lastSignInAt: new Date(),
    },
    {
      email: "teacher@example.com",
      passwordHash: pwd,
      name: "Teacher User",
      role: "teacher",
      title: "Mr",
      sex: "male",
      city: "Berlin",
      bio: "Experienced German language instructor with 10+ years of teaching.",
      lastSignInAt: new Date(),
    },
  ]);
  const [teacher] = await db.select().from(users).where(eq(users.email, "teacher@example.com"));
  if (!teacher) throw new Error("Failed to create teacher");

  await db.insert(users).values([
    {
      email: "anna@example.com",
      passwordHash: pwd,
      name: "Anna Schmidt",
      role: "student",
      sex: "female",
      age: 22,
      city: "Berlin",
      lastSignInAt: new Date(),
    },
    {
      email: "ben@example.com",
      passwordHash: pwd,
      name: "Ben Müller",
      role: "student",
      sex: "male",
      age: 25,
      city: "Hamburg",
      lastSignInAt: new Date(),
    },
    {
      email: "clara@example.com",
      passwordHash: pwd,
      name: "Clara Weber",
      role: "student",
      sex: "female",
      age: 20,
      city: "Munich",
      lastSignInAt: new Date(),
    },
  ]);
  const students = await db.select().from(users).where(eq(users.role, "student"));

  await db.insert(centers).values({
    name: "Berlin German School",
    description: "A certified German language school in the heart of Berlin. Offering courses from A1 to C2.",
    address: "Friedrichstraße 100, 10117 Berlin",
    phone: "+49 30 12345678",
    adminId: teacher.id,
    slug: "berlin-german-school",
  });
  const [center] = await db.select().from(centers).where(eq(centers.slug, "berlin-german-school"));
  if (!center) throw new Error("Failed to create center");

  await db.update(users).set({ centerId: center.id }).where(eq(users.id, teacher.id));
  for (const student of students) {
    await db.update(users).set({ centerId: center.id }).where(eq(users.id, student.id));
  }

  await db.insert(inviteCodes).values([
    { code: "BERLIN01", centerId: center.id },
    { code: "BERLIN02", centerId: center.id },
    { code: "BERLIN03", centerId: center.id },
    { code: "USEDCODE", centerId: center.id, usedBy: students[0]?.id ?? teacher.id, usedAt: new Date() },
  ]);

  await db.insert(lessons).values([
    {
      centerId: center.id,
      title: "German A1 - Introductions",
      description: "Learn how to introduce yourself in German. Covers greetings, name, age, and where you're from.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      order: 1,
    },
    {
      centerId: center.id,
      title: "German A1 - Numbers & Counting",
      description: "Master German numbers from 1 to 1000. Practice counting and using numbers in everyday situations.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      order: 2,
    },
    {
      centerId: center.id,
      title: "German A1 - Basic Verbs",
      description: "Essential German verbs and their conjugation in present tense. Includes sein, haben, gehen, and more.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      order: 3,
    },
  ]);
  const [lesson1, lesson2, lesson3] = await db.select().from(lessons).where(eq(lessons.centerId, center.id)).limit(3);

  // lesson 1 questions
  if (lesson1) {
    await db.insert(questions).values([
      { lessonId: lesson1.id, text: 'How do you say "Hello" in German?', options: ["Hallo", "Tschüss", "Danke", "Bitte"], correctAnswerIndex: 0 },
      { lessonId: lesson1.id, text: 'What is the German word for "Goodbye"?', options: ["Guten Morgen", "Tschüss", "Hallo", "Ja"], correctAnswerIndex: 1 },
      { lessonId: lesson1.id, text: "How do you ask 'What is your name?' in German?", options: ["Wie alt bist du?", "Wo wohnst du?", "Wie heißt du?", "Was machst du?"], correctAnswerIndex: 2 },
    ]);
  }
  // lesson 2 questions
  if (lesson2) {
    await db.insert(questions).values([
      { lessonId: lesson2.id, text: 'What is "drei" in English?', options: ["One", "Two", "Three", "Four"], correctAnswerIndex: 2 },
      { lessonId: lesson2.id, text: 'How do you say "twenty" in German?', options: ["Zehn", "Zwanzig", "Dreißig", "Zwei"], correctAnswerIndex: 1 },
    ]);
  }
  // lesson 3 questions
  if (lesson3) {
    await db.insert(questions).values([
      { lessonId: lesson3.id, text: 'What does "sein" mean in English?', options: ["To have", "To be", "To go", "To do"], correctAnswerIndex: 1 },
      { lessonId: lesson3.id, text: "What is the correct conjugation: 'Ich ___ ein Student'?", options: ["bin", "bist", "ist", "sind"], correctAnswerIndex: 0 },
      { lessonId: lesson3.id, text: 'What does "haben" mean?', options: ["To be", "To have", "To like", "To eat"], correctAnswerIndex: 1 },
    ]);
  }

  // quiz attempts
  const allQuestions = await db.select().from(questions);
  if (allQuestions.length > 0 && students[0]) {
    const lessonQ = allQuestions.filter((q) => q.lessonId === lesson1?.id);
    if (lessonQ.length > 0) {
      await db.insert(quizAttempts).values({
        studentId: students[0].id,
        lessonId: lesson1!.id,
        score: 2,
        totalQuestions: lessonQ.length,
        answers: [0, 1, 0],
        completedAt: new Date(Date.now() - 86400000),
      });
      await db.insert(quizAttempts).values({
        studentId: students[0].id,
        lessonId: lesson1!.id,
        score: 3,
        totalQuestions: lessonQ.length,
        answers: [0, 1, 2],
        completedAt: new Date(),
      });
    }
  }

  console.log("Seed complete.");
  console.log(`  Admin: admin@example.com / password123`);
  console.log(`  Teacher: teacher@example.com / password123`);
  console.log(`  Students: anna@example.com / password123`);
  console.log(`  Center: Berlin German School (slug: berlin-german-school)`);
  console.log(`  Invite codes: BERLIN01, BERLIN02, BERLIN03`);
  process.exit(0);
}

seed();
