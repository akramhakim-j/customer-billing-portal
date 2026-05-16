import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';
import { Location } from '../shared';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';

const mockCustomer: Customer = {
  id: 'test-uuid-1234',
  email: 'george.bluth@yahoo.com.my',
  firstName: 'George',
  lastName: 'Bluth',
  photo: 'https://reqres.in/img/faces/1-image.jpg',
  productId: '4000',
  location: Location.WEST_MALAYSIA,
  premiumPaid: '521.03',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

type MockRepository<T extends object = object> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('CustomersService', () => {
  let service: CustomersService;
  let repo: MockRepository<Customer>;
  let cacheManager: { stores: { clear: jest.Mock }[] };

  beforeEach(async () => {
    cacheManager = { stores: [{ clear: jest.fn().mockResolvedValue(undefined) }] };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: getRepositoryToken(Customer), useFactory: mockRepository },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repo = module.get(getRepositoryToken(Customer));
  });

  afterEach(() => jest.clearAllMocks());

  // ── create ──────────────────────────────────────────────────────────────────
  describe('create', () => {
    const dto: CreateCustomerDto = {
      email: 'george.bluth@yahoo.com.my',
      firstName: 'George',
      lastName: 'Bluth',
      photo: 'https://reqres.in/img/faces/1-image.jpg',
      productId: '4000',
      location: Location.WEST_MALAYSIA,
      premiumPaid: '521.03',
    };

    it('should create and return a customer', async () => {
      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(mockCustomer);
      repo.save!.mockResolvedValue(mockCustomer);

      const result = await service.create(dto);
      expect(result.email).toBe(dto.email);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(mockCustomer);
    });

    it('should throw ConflictException if email already exists', async () => {
      repo.findOne!.mockResolvedValue(mockCustomer);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ── findAll ──────────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return paginated customers', async () => {
      const query: QueryCustomersDto = { page: 1, limit: 10 };
      const qb = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCustomer], 1]),
      };
      repo.createQueryBuilder!.mockReturnValue(qb);

      const result = await service.findAll(query);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('should apply location filter when provided', async () => {
      const query: QueryCustomersDto = { page: 1, limit: 10, location: Location.WEST_MALAYSIA };
      const qb = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCustomer], 1]),
      };
      repo.createQueryBuilder!.mockReturnValue(qb);

      await service.findAll(query);
      expect(qb.andWhere).toHaveBeenCalledWith('customer.location = :location', {
        location: Location.WEST_MALAYSIA,
      });
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a customer by id', async () => {
      repo.findOne!.mockResolvedValue(mockCustomer);
      const result = await service.findOne('test-uuid-1234');
      expect(result.id).toBe('test-uuid-1234');
    });

    it('should throw NotFoundException if customer not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('should update and return the customer', async () => {
      const dto: UpdateCustomerDto = { premiumPaid: '999.99' };
      const updated = { ...mockCustomer, premiumPaid: '999.99' };
      repo.findOne!.mockResolvedValue(mockCustomer);
      repo.save!.mockResolvedValue(updated);

      const result = await service.update('test-uuid-1234', dto);
      expect(result.premiumPaid).toBe('999.99');
    });

    it('should throw NotFoundException if customer not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.update('bad-id', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new email is already taken', async () => {
      const dto: UpdateCustomerDto = { email: 'taken@example.com' };
      const existingWithSameEmail: Customer = { ...mockCustomer, id: 'other-id' };
      repo
        .findOne!.mockResolvedValueOnce(mockCustomer) // find by id
        .mockResolvedValueOnce(existingWithSameEmail); // find by new email
      await expect(service.update('test-uuid-1234', dto)).rejects.toThrow(ConflictException);
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────────
  describe('remove', () => {
    it('should remove the customer', async () => {
      repo.findOne!.mockResolvedValue(mockCustomer);
      repo.remove!.mockResolvedValue(undefined);
      await expect(service.remove('test-uuid-1234')).resolves.toBeUndefined();
      expect(repo.remove).toHaveBeenCalledWith(mockCustomer);
    });

    it('should throw NotFoundException if customer not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
