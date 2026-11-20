
import { db } from "../index.js";
import type { NewRefreshToken } from "../schema.js";
import { refreshTokens } from "../schema.js";

export async function createRefreshToken(
  refreshToken: NewRefreshToken
) {
  const [result] = await db
    .insert(refreshTokens)
    .values(refreshToken)
    .returning();

  return result;
}
