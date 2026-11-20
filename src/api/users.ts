import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { hashPassword } from "../auth.js";
import { BadRequestError } from "./errors.js";
import { users } from "../db/schema.js";
import { checkPasswordHash } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { UnauthorizedError } from "./errors.js";
import { makeJWT , makeRefreshToken} from "../auth.js";
import { config } from "../config.js";
import { createRefreshToken } from "../db/queries/refresh_tokens.js";

type UserResponse = Omit<
  typeof users.$inferSelect,
  "hashedPassword"
>;

export async function handlerCreateUser(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || email.trim() === "") {
    throw new BadRequestError("Email is required");
  }

  if (typeof password !== "string" || password.length === 0) {
    throw new BadRequestError("Password is required");
  }

  const hashedPassword = await hashPassword(password);

  const user = await createUser({
    email,
    hashedPassword,
  });

  if (!user) {
    res.status(409).json({ error: "Email already exists" });
    return;
  }

  const responseUser: UserResponse = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
  };

  res.status(201).json(responseUser);
}



export async function handlerLogin(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string") {
    throw new UnauthorizedError("incorrect email or password");
  }

  const user = await getUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError("incorrect email or password");
  }

  const passwordMatches = await checkPasswordHash(
    password,
    user.hashedPassword
  );

  if (!passwordMatches) {
    throw new UnauthorizedError("incorrect email or password");
  }

  // Create an access token that expires in 1 hour
  const token = makeJWT(
    user.id,
    3600,
    config.jwtSecret
  );

  // Create a refresh token
  const refreshToken = makeRefreshToken();

  // Set expiration to 60 days from now
  const expiresAt = new Date(
    Date.now() + 60 * 24 * 60 * 60 * 1000
  );

  // Save refresh token in the database
  await createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt,
    revokedAt: null,
  });

  // Return user details and both tokens
  res.status(200).json({
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token,
    refreshToken,
  });
}
