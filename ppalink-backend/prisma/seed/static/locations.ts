// prisma/seed/static/locations.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export async function seedGlobalLocations(prisma: PrismaClient) {
  console.log('\n🌎 Seeding global locations (Countries, Regions, Cities)...');

  // Clear existing location data to prevent duplicates on re-seed
  await prisma.city.deleteMany({});
  await prisma.region.deleteMany({});
  await prisma.country.deleteMany({});

  try {
    const dataPath = path.join(__dirname, '..', 'data', 'countries+states+cities.json');
    const locationsRaw = fs.readFileSync(dataPath, 'utf-8');
    const countries: any[] = JSON.parse(locationsRaw);

    for (const countryData of countries) {
      const country = await prisma.country.upsert({
        where: {
          iso2: countryData.iso2, // Use iso2 as unique identifier for upsert
        },
        update: {}, // No updates needed
        create: {
          name: countryData.name,
          iso2: countryData.iso2,
          currency: countryData.currency,
          capital: countryData.capital,
          phonecode: countryData.phonecode,
          emoji: countryData.emoji,
          latitude: parseFloat(countryData.latitude) || null,
          longitude: parseFloat(countryData.longitude) || null,
        },
      });

      for (const regionData of countryData.states) {
        const region = await prisma.region.upsert({
          where: {
            name_countryId: {
              name: regionData.name,
              countryId: country.id
            }
          },
          update: {}, // No updates needed
          create: {
            name: regionData.name,
            countryId: country.id,
            latitude: parseFloat(regionData.latitude) || null,
            longitude: parseFloat(regionData.longitude) || null,
          },
        });

        const cityData = regionData.cities.map((city: any) => ({
          name: city.name,
          regionId: region.id,
          latitude: parseFloat(city.latitude) || null,
          longitude: parseFloat(city.longitude) || null,
        }));

        if (cityData.length > 0) {
          await prisma.city.createMany({
            data: cityData,
            skipDuplicates: true,
          });
        }
      }
      console.log(`- Seeded: ${country.name}`);
    }

    console.log('✅ Global locations seeded successfully.');
  } catch (error) {
    console.error('❌ Failed to seed global locations:', error);
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  const prisma = new PrismaClient();
  seedGlobalLocations(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}