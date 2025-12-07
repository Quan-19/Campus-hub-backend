import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Define roles
  const roles = [
    { name: 'admin', description: 'Administrator with full system access' },
    { name: 'staff', description: 'Staff member with event management access' },
    { name: 'user', description: 'Regular user with basic access' },
  ];

  // Create roles
  for (const role of roles) {
    const existing = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (!existing) {
      await prisma.role.create({
        data: {
          name: role.name,
        },
      });
      console.log(`✓ Created role: ${role.name}`);
    } else {
      console.log(`✓ Role already exists: ${role.name}`);
    }
  }

  console.log('\n✅ Database seed completed successfully!');
  console.log('\nRoles summary:');
  const allRoles = await prisma.role.findMany();
  allRoles.forEach((r) => {
    console.log(`  - ${r.name} (ID: ${r.role_id})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
