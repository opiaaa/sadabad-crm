import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("degistir123", 10);
  const agentPassword = await bcrypt.hash("degistir123", 10);

  await prisma.user.upsert({
    where: { email: "admin@sadabademlak.com" },
    update: {},
    create: {
      name: "Yönetici",
      email: "admin@sadabademlak.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "danisman1@sadabademlak.com" },
    update: {},
    create: {
      name: "Danışman 1",
      email: "danisman1@sadabademlak.com",
      passwordHash: agentPassword,
      role: "AGENT",
    },
  });

  await prisma.user.upsert({
    where: { email: "talha@sadabademlak.com" },
    update: {},
    create: {
      name: "Talha",
      email: "talha@sadabademlak.com",
      passwordHash: agentPassword,
      role: "AGENT",
    },
  });

  await prisma.user.upsert({
    where: { email: "zahid@sadabademlak.com" },
    update: {},
    create: {
      name: "Zahid",
      email: "zahid@sadabademlak.com",
      passwordHash: agentPassword,
      role: "AGENT",
    },
  });

  console.log("Seed tamamlandı. Şifreleri ilk girişten sonra değiştirin.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
