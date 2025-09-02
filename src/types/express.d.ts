import { Request } from 'express';
import { User as UserEntity } from '../users/entities/user.entity';

export interface IUserRequest extends Request {
  user?: UserEntity;
}
