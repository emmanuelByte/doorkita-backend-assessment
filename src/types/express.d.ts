import { Request } from 'express';
import { UserRole } from '../users/entities/user.entity';

export interface IUserRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}
