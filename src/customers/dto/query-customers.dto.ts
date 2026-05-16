import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Location } from '../../shared';

export class QueryCustomersDto {
  @ApiPropertyOptional({ example: 2, description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 5, description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({
    enum: Location,
    example: Location.WEST_MALAYSIA,
    description: 'Filter by location',
  })
  @IsOptional()
  @IsEnum(Location)
  location?: Location;

  @ApiPropertyOptional({ example: '5200', description: 'Filter by product ID' })
  @IsOptional()
  @IsString()
  productId?: string;
}
