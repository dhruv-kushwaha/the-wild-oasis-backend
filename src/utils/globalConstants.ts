import { supabaseUrl } from "./supabase";

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHENTICATED = 401,
  UNAUTHORIZED = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export const COOKIE_EXPIRY = process.env
  .JWT_COOKIE_EXPIRES_IN as unknown as number;

export const DEFAULT_USER: string = `${supabaseUrl}/storage/v1/object/public/avatars/default-user.jpg?t=2024-03-16T04%3A01%3A49.629Z`;
