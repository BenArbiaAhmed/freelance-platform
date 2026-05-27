import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marks a route as accessible without authentication when JwtAuthGuard is applied. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
