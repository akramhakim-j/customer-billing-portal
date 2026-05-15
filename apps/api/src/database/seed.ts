import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Customer } from '../customers/entities/customer.entity';
import { Location } from '@zurich/shared';

config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get<number>('DATABASE_PORT', 5432),
  username: configService.get('DATABASE_USERNAME', 'postgres'),
  password: configService.get('DATABASE_PASSWORD', 'postgres'),
  database: configService.get('DATABASE_NAME', 'CUSTOMER_BILLING_PORTAL'),
  entities: [Customer],
  synchronize: true,
});

const seedData = [
  {
    email: 'george.bluth@yahoo.com.my',
    firstName: 'George',
    lastName: 'Bluth',
    photo: 'https://reqres.in/img/faces/1-image.jpg',
    productId: '4000',
    location: Location.WEST_MALAYSIA,
    premiumPaid: '521.03',
  },
  {
    email: 'janet.weaver@gmail.com',
    firstName: 'Janet',
    lastName: 'Weaver',
    photo: 'https://reqres.in/img/faces/2-image.jpg',
    productId: '5000',
    location: Location.EAST_MALAYSIA,
    premiumPaid: '0.00',
  },
  {
    email: 'emma.wong@mailsaur.net',
    firstName: 'Emma',
    lastName: 'Wong',
    photo: 'https://reqres.in/img/faces/3-image.jpg',
    productId: '5000',
    location: Location.EAST_MALAYSIA,
    premiumPaid: '1453.50',
  },
];

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected. Seeding...');

  const repo = AppDataSource.getRepository(Customer);

  for (const data of seedData) {
    const existing = await repo.findOne({ where: { email: data.email } });
    if (!existing) {
      const customer = repo.create(data);
      await repo.save(customer);
      console.log(`Created: ${data.email}`);
    } else {
      console.log(`Skipped (exists): ${data.email}`);
    }
  }

  await AppDataSource.destroy();
  console.log('Seeding complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
