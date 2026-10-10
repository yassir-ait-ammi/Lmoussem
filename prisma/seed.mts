import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const dayInMs = 24 * 60 * 60 * 1000;

function daysFromNow(days: number, hour: number) {
  const date = new Date(Date.now() + days * dayInMs);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
}

const sampleEvents = [
  {
    title: "Welcome Day for New Students",
    description:
      "Campus tour, meeting with the student clubs and a welcome lunch for everyone joining this year.",
    date: daysFromNow(7, 9),
    place: "UM6P Benguerir",
    capacity: 200,
  },
  {
    title: "Introduction to Full-Stack Web Development",
    description:
      "A hands-on workshop that goes from an empty folder to a deployed web application in one afternoon.",
    date: daysFromNow(14, 13),
    place: "UM6P Benguerir",
    capacity: 30,
  },
  {
    title: "AI and Agriculture Conference",
    description:
      "Researchers and startups present how machine learning is used to improve yields and save water.",
    date: daysFromNow(21, 8),
    place: "UM6P Rabat",
    capacity: 120,
  },
  {
    title: "Startup Pitch Night",
    description:
      "Ten student teams pitch their project to a jury of investors. Networking session afterwards.",
    date: daysFromNow(30, 17),
    place: "StartGate Benguerir",
    capacity: 80,
  },
  {
    title: "Mentoring Session with Alumni",
    description:
      "A small-group session to talk about internships, first jobs and career choices with former students.",
    date: daysFromNow(10, 15),
    place: "UM6P Rabat",
    capacity: 2,
  },
  {
    title: "Hackathon Kick-off",
    description:
      "Opening ceremony of last month's 48-hour hackathon, kept here as an example of a past event.",
    date: daysFromNow(-20, 9),
    place: "UM6P Benguerir",
    capacity: 100,
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in the .env file");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { name: "Administrator", email, passwordHash, role: "ADMIN" },
  });
  console.log(`Admin account ready: ${email}`);

  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    await prisma.event.createMany({ data: sampleEvents });
    console.log(`${sampleEvents.length} sample events created`);
  } else {
    console.log("Events already exist, no sample events added");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
