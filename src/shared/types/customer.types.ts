import { Location } from '../enums/location.enum';
import { Role } from '../enums/role.enum';

export interface ICustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photo: string;
  productId: string;
  location: Location;
  premiumPaid: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJwtPayload {
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
