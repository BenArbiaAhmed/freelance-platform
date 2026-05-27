import { UserRole } from '../../users/entities/user.entity';

/** Claims encoded into the signed JWT. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/** Shape attached to `request.user` once a JWT is validated. */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}
