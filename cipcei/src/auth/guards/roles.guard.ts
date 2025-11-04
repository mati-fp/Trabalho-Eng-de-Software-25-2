import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Usar getAllAndOverride para metadata de método E classe
    // Se o método tiver @Roles, usa apenas o do método
    // Se não, usa o da classe (se houver)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não há roles definidas, permite o acesso
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Admin tem acesso a tudo
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Verifica se o usuário tem uma das roles necessárias
    return requiredRoles.some((role) => user.role === role);
  }
}