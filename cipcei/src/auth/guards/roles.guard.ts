import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se a rota é pública, permite o acesso
    if (isPublic) {
      return true;
    }

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

    // Se não há usuário autenticado, nega o acesso
    if (!user) {
      return false;
    }

    // Admin tem acesso a tudo
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Verifica se o usuário tem uma das roles necessárias
    return requiredRoles.some((role) => user.role === role);
  }
}