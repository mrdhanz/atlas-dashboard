import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// The 'NextAuth' export is a function that returns the middleware.
// We are only interested in the `auth` property, which is the middleware function.
export default NextAuth(authConfig).auth;

// The matcher config remains the same.
export const config = {
  // We exclude api, next/static, next/image, and image assets from the middleware.
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};