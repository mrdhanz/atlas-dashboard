// auth.ts

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // All logic is now handled by our Go microservice
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // This is the URL of our Go service inside the Docker network.
          // 'auth-service' is the hostname defined in docker-compose.yml.
          const response = await fetch("http://auth-service:8080/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          
          if (!response.ok) {
            // If the Go service returns 401, 500, etc., we reject the login.
            console.error("Login failed from backend:", response.status, response.statusText);
            return null;
          }

          const user = await response.json();

          // If the user data is returned, authentication is successful.
          // The user object MUST match what your Go service returns.
          if (user) {
            return user;
          }

          return null;

        } catch (error) {
          console.error("Network error during authentication:", error);
          // A network or other error occurred
          return null;
        }
      },
    }),
  ],
})