import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { PaginatedCustomersDto } from './dto/paginated-customers.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const existing = await this.customerRepository.findOne({
      where: { email: createCustomerDto.email },
    });
    if (existing) {
      throw new ConflictException(
        `Customer with email ${createCustomerDto.email} already exists`,
      );
    }

    const customer = this.customerRepository.create(createCustomerDto);
    const saved = await this.customerRepository.save(customer);
    return this.toResponseDto(saved);
  }

  async findAll(query: QueryCustomersDto): Promise<PaginatedCustomersDto> {
    const { page, limit, location, productId } = query;
    const skip = (page - 1) * limit;

    const qb = this.customerRepository.createQueryBuilder('customer');

    if (location) {
      qb.andWhere('customer.location = :location', { location });
    }
    if (productId) {
      qb.andWhere('customer.productId = :productId', { productId });
    }

    const [customers, total] = await qb
      .orderBy('customer.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: customers.map((c) => this.toResponseDto(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return this.toResponseDto(customer);
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    // Check email uniqueness if email is being changed
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const emailExists = await this.customerRepository.findOne({
        where: { email: updateCustomerDto.email },
      });
      if (emailExists) {
        throw new ConflictException(
          `Email ${updateCustomerDto.email} is already in use`,
        );
      }
    }

    Object.assign(customer, updateCustomerDto);
    const saved = await this.customerRepository.save(customer);
    return this.toResponseDto(saved);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    await this.customerRepository.remove(customer);
  }

  private toResponseDto(customer: Customer): CustomerResponseDto {
    return plainToInstance(CustomerResponseDto, customer, {
      excludeExtraneousValues: true,
    });
  }
}
