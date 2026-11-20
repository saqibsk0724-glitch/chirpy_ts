import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { hashPassword } from "../auth.js";
import { BadRequestError } from "./errors.js";
import { users } from "../db/schema.js";
import { checkPasswordHash } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";
import { UnauthorizedError } from "./errors.js";
import { makeJWT } from "../auth.js";
import { config } from "../config.js";

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
  const { email, password, expiresInSeconds } = req.body as {
    email?: unknown;
    password?: unknown;
    expiresInSeconds?: unknown;
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

  // Default expiration: 1 hour
  let expiresIn = 3600;

  if (expiresInSeconds !== undefined) {
    if (
      typeof expiresInSeconds !== "number" ||
      !Number.isFinite(expiresInSeconds) ||
      expiresInSeconds <= 0
    ) {
      throw new BadRequestError("Invalid expiration time");
    }

    // Never allow more than 1 hour
    expiresIn = Math.min(expiresInSeconds, 3600);
  }

  const token = makeJWT(
    user.id,
    expiresIn,
    config.jwtSecret
  );

  res.status(200).json({
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token,
  });
}
