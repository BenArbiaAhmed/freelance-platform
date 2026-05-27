import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

/**
 * Validates email + password at login. `usernameField` maps passport's default
 * `username` field onto our `email` field; the password field stays `motDePasse`.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'motDePasse' });
  }

  async validate(email: string, motDePasse: string): Promise<User> {
    const user = await this.authService.validateUser(email, motDePasse);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return user;
  }
}
