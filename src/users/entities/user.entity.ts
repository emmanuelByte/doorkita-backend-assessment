import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  DOCTOR = 'doctor',
  LAB = 'lab',
  PATIENT = 'patient',
}

@Entity('users')
export class User {
  @ApiProperty({
    description: 'User ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'doctor@example.com',
  })
  @Column({ unique: true })
  @Index()
  email: string;

  @ApiProperty({
    description: 'Hashed user password',
    example: '$2b$10$51JRc/bmD9EuV0tow4yFJO8rz3yZc6vIlWk0owHgVAkx/wC3N6KXq',
  })
  @Column()
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @Column()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @Column()
  lastName: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.DOCTOR,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2025-09-02T13:14:13.633Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2025-09-02T13:14:13.633Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
