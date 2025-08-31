import type { DefaultSession } from "next-auth";
import type { User } from "./user";

// Extend the default session to include our custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      jwt: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    jwt: string;
  }
}

// JWT token interface
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    jwt: string;
  }
}

// Login credentials interface
export interface LoginCredentials {
  identifier: string;
  password: string;
}

// Registration data interface
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Strapi auth response interface
export interface StrapiAuthResponse {
  jwt: string;
  user: User;
}

// API error response interface
export interface ApiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}
