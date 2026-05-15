import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Location } from '@zurich/shared';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { PaginatedCustomersDto } from './dto/paginated-customers.dto';

const mockCustomerResponse: CustomerResponseDto = {
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

const mockPaginated: PaginatedCustomersDto = {
  data: [mockCustomerResponse],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const mockCustomersService = {
  create: jest.fn().mockResolvedValue(mockCustomerResponse),
  findAll: jest.fn().mockResolvedValue(mockPaginated),
  findOne: jest.fn().mockResolvedValue(mockCustomerResponse),
  update: jest.fn().mockResolvedValue(mockCustomerResponse),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CustomersService, useValue: mockCustomersService },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      const dto = {
        email: 'george.bluth@yahoo.com.my',
        firstName: 'George',
        lastName: 'Bluth',
        photo: 'https://reqres.in/img/faces/1-image.jpg',
        productId: '4000',
        location: Location.WEST_MALAYSIA,
        premiumPaid: '521.03',
      };
      const result = await controller.create(dto);
      expect(result).toEqual(mockCustomerResponse);
      expect(mockCustomersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return paginated result', async () => {
      const result = await controller.findAll({ page: 1, limit: 10 });
      expect(result).toEqual(mockPaginated);
      expect(mockCustomersService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should return a single customer', async () => {
      const result = await controller.findOne('test-uuid-1234');
      expect(result).toEqual(mockCustomerResponse);
      expect(mockCustomersService.findOne).toHaveBeenCalledWith('test-uuid-1234');
    });
  });

  describe('update', () => {
    it('should call service.update and return result', async () => {
      const dto = { premiumPaid: '999.99' };
      const result = await controller.update('test-uuid-1234', dto);
      expect(result).toEqual(mockCustomerResponse);
      expect(mockCustomersService.update).toHaveBeenCalledWith('test-uuid-1234', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      await controller.remove('test-uuid-1234');
      expect(mockCustomersService.remove).toHaveBeenCalledWith('test-uuid-1234');
    });
  });
});
