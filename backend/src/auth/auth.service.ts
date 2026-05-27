import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface AuthResult {
  accessToken: string;
  user: Omit<User, 'motDePasse' | 'hashPassword'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /** Verifies credentials for the local strategy; returns the user without its hash. */
  async validateUser(
    email: string,
    motDePasse: string,
  ): Promise<User | null> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      return null;
    }
    const matches = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!matches) {
      return null;
    }
    return this.stripPassword(user);
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }
    // UsersService.create persists the user; the entity's @BeforeInsert hook
    // hashes motDePasse, so we never store the plaintext.
    const user = await this.usersService.create(dto);
    return this.buildAuthResult(user);
  }

  /** Issues a token for an already-validated user (passed by the local strategy). */
  login(user: User): AuthResult {
    return this.buildAuthResult(user);
  }

  private buildAuthResult(user: User): AuthResult {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: this.stripPassword(user),
    };
  }

  private stripPassword(user: User): Omit<User, 'motDePasse' | 'hashPassword'> {
    const { motDePasse: _motDePasse, hashPassword: _hashPassword, ...rest } =
      user;
    return rest;
  }
}
