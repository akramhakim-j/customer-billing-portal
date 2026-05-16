import { ApiProperty } from '@nestjs/swagger';
import { CustomerResponseDto } from './customer-response.dto';

export class PaginatedCustomersDto {
  @ApiProperty({ type: [CustomerResponseDto] })
  data: CustomerResponseDto[];

  @ApiProperty({ example: 24 })
  total: number;

  @ApiProperty({ example: 2 })
  page: number;

  @ApiProperty({ example: 5 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
