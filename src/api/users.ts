import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";

import { BadRequestError } from "./errors.js";
import { users } from "../db/schema.js";
import { checkPasswordHash } from "../auth.js";
import { getUserByEmail , updateUser} from "../db/queries/users.js";
import { UnauthorizedError , NotFoundError } from "./errors.js";
import { makeJWT , makeRefreshToken} from "../auth.js";
import { config } from "../config.js";
import { createRefreshToken , revokeRefreshToken , userForRefreshToken } from "../db/queries/refresh_tokens.js";
import { getBearerToken , validateJWT , hashPassword } from "../auth.js";




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
    isChirpyRed : user.isChirpyRed,
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
    isChirpyRed : user.isChirpyRed,
    token,
    refreshToken,
  });
}


export async function handlerRevoke(
  req: Request,
  res: Response
): Promise<void> {
  const token = getBearerToken(req);

  await revokeRefreshToken(token);

  res.status(204).send();
}
export async function handlerRefresh(
  req: Request,
  res: Response
): Promise<void> {
  const token = getBearerToken(req);

  const user = await userForRefreshToken(token);

  if (!user) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const accessToken = makeJWT(
    user.id,
    3600,
    config.jwtSecret
  );

  res.status(200).json({
    token: accessToken,
  });
}


export async function handlerUpdateUser(
  req: Request,
  res: Response
): Promise<void> {
  // 1. Authenticate the user
  let userId: string;

  try {
    const token = getBearerToken(req);
    userId = validateJWT(token, config.jwtSecret);
  } catch {
    throw new UnauthorizedError("Invalid or missing access token");
  }

  // 2. Validate the request body
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string") {
    throw new BadRequestError("Email and password are required");
  }

  // 3. Hash the new password
  const hashedPassword = await hashPassword(password);

  // 4. Update the authenticated user's account
  const user = await updateUser(userId, email, hashedPassword);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // 5. Return the updated user without the password hash
  const { hashedPassword: _, ...userResponse } = user;

  res.status(200).json(userResponse);
}