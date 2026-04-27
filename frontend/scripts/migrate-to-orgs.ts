import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting migration to multi-tenancy...');

  // 1. Create a default organization if none exists
  let defaultOrg = await prisma.organization.findFirst();
  
  if (!defaultOrg) {
    console.log('🏢 Creating default organization...');
    defaultOrg = await prisma.organization.create({
      data: {
        name: 'Default Organization',
        slug: 'default-org',
      },
    });
  }

  const orgId = defaultOrg.id;
  console.log(`✅ Using Organization ID: ${orgId}`);

  // 2. Update existing data (Note, Chunk, GraphNode, MemorySession)
  // We use raw SQL to handle existing records that may have NULL orgId during schema transition
  
  try {
    console.log('📝 Updating notes...');
    await prisma.$executeRawUnsafe(`UPDATE notes SET "orgId" = '${orgId}'::uuid WHERE "orgId" IS NULL`);
    
    console.log('🧩 Updating chunks...');
    await prisma.$executeRawUnsafe(`UPDATE chunks SET "orgId" = '${orgId}'::uuid WHERE "orgId" IS NULL`);
    
    console.log('🕸️ Updating graph nodes...');
    await prisma.$executeRawUnsafe(`UPDATE graph_nodes SET "orgId" = '${orgId}'::uuid WHERE "orgId" IS NULL`);
    
    console.log('🧠 Updating memory sessions...');
    await prisma.$executeRawUnsafe(`UPDATE memory_sessions SET "orgId" = '${orgId}'::uuid WHERE "orgId" IS NULL`);

    console.log('🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
