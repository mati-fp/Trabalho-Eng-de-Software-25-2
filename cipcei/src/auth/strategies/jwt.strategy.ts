import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;      // user ID
  email: string;
  role: string;
  companyId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "sua_chave_secreta_muito_forte_aqui_min_32_caracteres", //configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Buscar usuário atualizado no banco
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário inativo ou não encontrado');
    }

    // Retorna o user que será anexado ao request como req.user
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
      user: user, // objeto completo disponível
    };
  }
}