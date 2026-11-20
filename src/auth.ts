
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { BadRequestError } from "./api/errors.js";
import type { Request } from "express";

// Password hashing
export async function hashPassword(
  password: string
): Promise<string> {
  return await argon2.hash(password);
}

// Password verification
export async function checkPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  return await argon2.verify(hash, password);
}

// JWT payload type
type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

// Create a JWT
export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string
): string {
  const iat = Math.floor(Date.now() / 1000);

  const payload: Payload = {
    iss: "chirpy",
    sub: userID,
    iat: iat,
    exp: iat + expiresIn,
  };

  return jwt.sign(payload, secret);
}

// Validate a JWT
export function validateJWT(
  tokenString: string,
  secret: string
): string {
  const decoded = jwt.verify(tokenString, secret);

  if (typeof decoded === "string" || typeof decoded.sub !== "string") {
    throw new Error("Invalid token payload");
  }

  return decoded.sub;
}


export function extractBearerToken(
  authorization: string | undefined
): string {
  if (!authorization) {
    throw new BadRequestError("Missing authorization header");
  }

  const [scheme, token] = authorization.trim().split(/\s+/, 2);

  if (scheme !== "Bearer" || !token) {
    throw new BadRequestError("Invalid authorization header");
  }

  return token;
}


export function getBearerToken(req: Request): string {
  const authorization = req.get("Authorization");

  return extractBearerToken(authorization);
}