import type { Request, Response } from "express";
import { upgradeUserToChirpyRed } from "../db/queries/users.js";
import { NotFoundError , UnauthorizedError   } from "./errors.js";
import { getAPIKey } from "../auth.js";
import {config} from "../config.js"

export async function handlerPolkaWebhook(
  req: Request,
  res: Response
): Promise<void> {
  
  const apiKey = getAPIKey(req)

  if (apiKey !== config.api.polkaKey){
    throw new UnauthorizedError("Invalid API key")
  }
  
  
  
  
  
  
  
    const { event, data } = req.body as {
    event?: unknown;
    data?: {
      userId?: unknown;
    };
  };

  // Ignore events we don't care about  
  if (event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  // Get the user ID from the webhook
  const userId = data?.userId;

  if (typeof userId !== "string") {
    throw new NotFoundError("User not found");
  }

  // Upgrade the user
  const user = await upgradeUserToChirpyRed(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Successful webhook: no response body
  res.status(204).send();
}