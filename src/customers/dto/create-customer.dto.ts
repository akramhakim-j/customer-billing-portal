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
  @ApiProperty({ example: 'george.bluth@yahoo.com.my', description: 'Unique customer email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'George', description: 'Customer first name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Bluth', description: 'Customer last name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    example: 'https://reqres.in/img/faces/1-image.jpg',
    description: 'URL to customer photo',
  })
  @IsUrl()
  photo: string;

  @ApiProperty({ example: '4000', description: 'Insurance product ID' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  productId: string;

  @ApiProperty({ enum: Location, example: Location.WEST_MALAYSIA, description: 'Customer location' })
  @IsEnum(Location)
  location: Location;

  @ApiProperty({ example: '521.03', description: 'Premium amount paid (decimal string)' })
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'premiumPaid must be a valid decimal with up to 2 decimal places' })
  premiumPaid: string;
}
