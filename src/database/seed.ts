import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Customer } from '../customers/entities/customer.entity';
import { Location } from '../shared';

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
  {
    email: 'eve.holt@googlemail.co.uk',
    firstName: 'Eve',
    lastName: 'Holt',
    photo: 'https://reqres.in/img/faces/4-image.jpg',
    productId: '5000',
    location: Location.EAST_MALAYSIA,
    premiumPaid: '210.00',
  },
  {
    email: 'charles.morris@grabmart.com.my',
    firstName: 'Charles',
    lastName: 'Morris',
    photo: 'https://reqres.in/img/faces/5-image.jpg',
    productId: '4000',
    location: Location.WEST_MALAYSIA,
    premiumPaid: '700.00',
  },
  {
    email: 'tracey.remos@gmail.com',
    firstName: 'Tracey',
    lastName: 'Ramos',
    photo: 'https://reqres.in/img/faces/6-image.jpg',
    productId: '4000',
    location: Location.WEST_MALAYSIA,
    premiumPaid: '0.00',
  },
  {
    email: 'michael.jackson@sony.com',
    firstName: 'Michael',
    lastName: 'Jackson',
    photo: 'https://reqres.in/img/faces/7-image.jpg',
    productId: '5000',
    location: Location.EAST_MALAYSIA,
    premiumPaid: '0.00',
  },
  {
    email: 'gwen.ferguson@bluebottle.com',
    firstName: 'Gwendolyn',
    lastName: 'Ferguson',
    photo: 'https://reqres.in/img/faces/8-image.jpg',
    productId: '4000',
    location: Location.WEST_MALAYSIA,
    premiumPaid: '342.20',
  },
  {
    email: 'tobias.funke@docomo.co.jp',
    firstName: 'Tobias',
    lastName: 'Funke',
    photo: 'https://reqres.in/img/faces/9-image.jpg',
    productId: '4000',
    location: Location.EAST_MALAYSIA,
    premiumPaid: '95.55',
  },
  {
    email: 'byron.fields@gmail.com',
    firstName: 'Byron',
    lastName: 'Fields',
    photo: 'https://reqres.in/img/faces/10-image.jpg',
    productId: '4000',
    location: Location.WEST_MALAYSIA,
    premiumPaid: '0.00',
  },
  {
    email: 'george.edwards@yahoo.co.id',
    firstName: 'George',
    lastName: 'Edwards',
    photo: 'https://reqres.in/img/faces/11-image.jpg',
    productId: '5000',
    location: Location.EAST_MALAYSIA,
    premiumPaid: '105.90',
  },
  {
    email: 'rachel.winterson@altavista.com',
    firstName: 'Rachel',
    lastName: 'Winterson',
    photo: 'https://reqres.in/img/faces/12-image.jpg',
    productId: '4000',
    location: Location.WEST_MALAYSIA,
    premiumPaid: '0.00',
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
