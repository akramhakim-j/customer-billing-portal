import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { Customer } from '../src/customers/entities/customer.entity';
import { Location } from '../src/shared';

/**
 * E2E tests — run against a mocked repository.
 * For full DB tests, point DATABASE_* env vars at a test database.
 */
describe('Customers API (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;

  const seedCustomers: Customer[] = [];

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([seedCustomers, seedCustomers.length]),
    })),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Customer))
      .useValue(mockRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    adminToken = jwtService.sign({ sub: 'admin-user', role: 'admin' });
    userToken = jwtService.sign({ sub: 'regular-user', role: 'user' });
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => jest.clearAllMocks());

  const mockCustomer: Customer = {
    id: 'uuid-1234',
    email: 'george.bluth@yahoo.com.my',
    firstName: 'George',
    lastName: 'Bluth',
    photo: 'https://reqres.in/img/faces/1-image.jpg',
    productId: '4000',
    location: Location.WEST_MALAYSIA,
    premiumPaid: '521.03',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Authentication', () => {
    it('GET /customers should return 401 without token', () => {
      return request(app.getHttpServer()).get('/customers').expect(401);
    });
  });

  describe('GET /customers', () => {
    it('should return paginated customers for authenticated user', () => {
      seedCustomers.push(mockCustomer);
      return request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
        });
    });
  });

  describe('GET /customers/:id', () => {
    it('should return a customer by id', () => {
      mockRepo.findOne.mockResolvedValue(mockCustomer);
      return request(app.getHttpServer())
        .get('/customers/uuid-1234')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(mockCustomer.email);
        });
    });

    it('should return 404 for unknown id', () => {
      mockRepo.findOne.mockResolvedValue(null);
      return request(app.getHttpServer())
        .get('/customers/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('POST /customers', () => {
    it('should forbid regular users', () => {
      return request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);
    });

    it('should create a customer as admin', () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(mockCustomer);
      mockRepo.save.mockResolvedValue(mockCustomer);

      return request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'george.bluth@yahoo.com.my',
          firstName: 'George',
          lastName: 'Bluth',
          photo: 'https://reqres.in/img/faces/1-image.jpg',
          productId: '4000',
          location: 'West Malaysia',
          premiumPaid: '521.03',
        })
        .expect(201);
    });
  });

  describe('DELETE /customers/:id', () => {
    it('should forbid regular users', () => {
      return request(app.getHttpServer())
        .delete('/customers/uuid-1234')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should delete customer as admin', () => {
      mockRepo.findOne.mockResolvedValue(mockCustomer);
      mockRepo.remove.mockResolvedValue(undefined);
      return request(app.getHttpServer())
        .delete('/customers/uuid-1234')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });
});

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
