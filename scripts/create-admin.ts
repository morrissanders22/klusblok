/**
 * One-time admin seed.
 * Run with: npx tsx scripts/create-admin.ts
 *
 * Defaults can be overridden via env:
 *   ADMIN_EMAIL=foo@bar.com ADMIN_PASSWORD=secret ADMIN_NAME="Foo" npx tsx scripts/create-admin.ts
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@klusblok.nl";
  const password = process.env.ADMIN_PASSWORD ?? "adminadmin";
  const name = process.env.ADMIN_NAME ?? "Klusblok Admin";

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
        passwordHash,
        name,
        emailVerified: new Date(),
      },
    });
    console.log(`Updated existing user ${email} → ADMIN`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "ADMIN",
        emailVerified: new Date(),
        phone: "+31000000000",
      },
    });
    console.log(`Created new admin user ${email}`);
  }
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
