import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (err || !user) {
      // info?.message reveals if it's "jwt expired", "invalid signature", or "no auth token"
      const details = info?.message ? `: ${info.message}` : '';
      throw err || new UnauthorizedException(`Unauthorized access${details}`);
    }
    return user;
  }
}