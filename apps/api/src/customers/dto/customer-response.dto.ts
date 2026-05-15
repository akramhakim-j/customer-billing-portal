import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Location } from '@zurich/shared';

export class CustomerResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'george.bluth@yahoo.com.my' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'George' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Bluth' })
  @Expose()
  lastName: string;

  @ApiProperty({ example: 'https://reqres.in/img/faces/1-image.jpg' })
  @Expose()
  photo: string;

  @ApiProperty({ example: '4000' })
  @Expose()
  productId: string;

  @ApiProperty({ enum: Location, example: Location.WEST_MALAYSIA })
  @Expose()
  location: Location;

  @ApiProperty({ example: '521.03' })
  @Expose()
  premiumPaid: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
