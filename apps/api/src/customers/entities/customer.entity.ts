import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Location } from '@zurich/shared';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 500 })
  photo: string;

  @Column({ name: 'product_id', type: 'varchar', length: 50 })
  productId: string;

  @Index()
  @Column({ type: 'enum', enum: Location })
  location: Location;

  @Column({ name: 'premium_paid', type: 'decimal', precision: 10, scale: 2, default: '0.00' })
  premiumPaid: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
