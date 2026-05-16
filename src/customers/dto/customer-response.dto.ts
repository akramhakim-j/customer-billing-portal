import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Location } from '../../shared';

export class CustomerResponseDto {
  @ApiProperty({ example: 'e7f8a9b0-c1d2-3456-efab-789012345678' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'azli.harun@gmail.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'Azli' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Harun' })
  @Expose()
  lastName: string;

  @ApiProperty({ example: 'https://reqres.in/img/faces/7-image.jpg' })
  @Expose()
  photo: string;

  @ApiProperty({ example: '5200' })
  @Expose()
  productId: string;

  @ApiProperty({ enum: Location, example: Location.WEST_MALAYSIA })
  @Expose()
  location: Location;

  @ApiProperty({ example: '1024.50' })
  @Expose()
  premiumPaid: string;

  @ApiProperty({ example: '2025-03-10T09:15:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-06-22T14:45:00.000Z' })
  @Expose()
  updatedAt: Date;
}
