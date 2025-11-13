import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/users/entities/user.entity';

export const Roles = Reflector.createDecorator<UserRole[]>();
