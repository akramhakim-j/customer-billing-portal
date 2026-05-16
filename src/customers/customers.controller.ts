import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { PaginatedCustomersDto } from './dto/paginated-customers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../shared';

@ApiTags('customers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer (admin only)' })
  @ApiResponse({ status: 201, type: CustomerResponseDto })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get all customers with pagination and optional filters' })
  @ApiResponse({ status: 200, type: PaginatedCustomersDto })
  findAll(@Query() query: QueryCustomersDto): Promise<PaginatedCustomersDto> {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get a single customer by ID' })
  @ApiParam({
    name: 'id',
    description: 'Customer UUID',
    example: 'e7f8a9b0-c1d2-3456-efab-789012345678',
  })
  @ApiResponse({ status: 200, type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CustomerResponseDto> {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update customer details or premium paid (admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Customer UUID',
    example: 'e7f8a9b0-c1d2-3456-efab-789012345678',
  })
  @ApiResponse({ status: 200, type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a customer (admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Customer UUID',
    example: 'e7f8a9b0-c1d2-3456-efab-789012345678',
  })
  @ApiResponse({ status: 204, description: 'Customer deleted' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.customersService.remove(id);
  }
}
