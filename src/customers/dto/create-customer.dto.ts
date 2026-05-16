import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  IsUrl,
  IsNumberString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Location } from '../../shared';

export class CreateCustomerDto {
  @ApiProperty({ example: 'azli.harun@gmail.com', description: 'Unique customer email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Azli', description: 'Customer first name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Harun', description: 'Customer last name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    example: 'https://reqres.in/img/faces/7-image.jpg',
    description: 'URL to customer photo',
  })
  @IsUrl()
  photo: string;

  @ApiProperty({ example: '5200', description: 'Insurance product ID' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  productId: string;

  @ApiProperty({
    enum: Location,
    example: Location.WEST_MALAYSIA,
    description: 'Customer location',
  })
  @IsEnum(Location)
  location: Location;

  @ApiProperty({ example: '1024.50', description: 'Premium amount paid (decimal string)' })
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'premiumPaid must be a valid decimal with up to 2 decimal places',
  })
  premiumPaid: string;
}
