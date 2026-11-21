
import { db } from "../index.js";
import type { NewRefreshToken } from "../schema.js";
import { refreshTokens , users } from "../schema.js";
import { and, eq, gt, isNull } from "drizzle-orm";


export async function createRefreshToken(
  refreshToken: NewRefreshToken
) {
  const [result] = await db
    .insert(refreshTokens)
    .values(refreshToken)
    .returning();

  return result;
}

export async function revokeRefreshToken(token: string) {
  await db
    .update(refreshTokens)
    .set({
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(refreshTokens.token, token));
}

export async function userForRefreshToken(token: string) {
  const [result] = await db
    .select({
      id: users.id,
    })
    .from(refreshTokens)
    .innerJoin(users, eq(refreshTokens.userId, users.id))
    .where(
      and(
        eq(refreshTokens.token, token),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date())
      )
    );

  return result;
}