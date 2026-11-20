
import { Request, Response } from "express";
import { createChirp } from "../db/queries/chirps.js";

import { getAllChirps } from "../db/queries/chirps.js";
import { getChirp } from "../db/queries/chirps.js";

import { BadRequestError, NotFoundError } from "./errors.js";

import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";
import { UnauthorizedError } from "./errors.js";

type ChirpParams = {
  body: string;
  userId: string;
};

const profaneWords = ["kerfuffle", "sharbert", "fornax"];


export async function handlerCreateChirp(
  req: Request,
  res: Response
): Promise<void> {
  // Extract the JWT from the Authorization header
  const token = getBearerToken(req);

  // Validate the JWT and get the user's ID
  let userId: string;

  try {
    userId = validateJWT(token, config.jwtSecret);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }

  // Get the chirp body
  const params = req.body as {
    body?: unknown;
  };

  if (typeof params?.body !== "string") {
    throw new BadRequestError("Chirp body is required");
  }

  if (params.body.length > 140) {
    throw new BadRequestError(
      "Chirp is too long. Max length is 140"
    );
  }

  // Clean profane words
  const words = params.body.split(" ");

  const cleanedWords = words.map((word) => {
    if (profaneWords.includes(word.toLowerCase())) {
      return "****";
    }

    return word;
  });

  const cleanedBody = cleanedWords.join(" ");

  // Save chirp using the authenticated user's ID
  const chirp = await createChirp({
    body: cleanedBody,
    userId,
  });

  res.status(201).json(chirp);
}

 


export async function handlerGetAllChirps(
  req: Request,
  res: Response
): Promise<void> {
  const chirps = await getAllChirps();

  res.status(200).json(chirps);
}


export async function handlerGetChirp(
  req: Request,
  res: Response
): Promise<void> {
  const chirpId = req.params.chirpId;

  if (typeof chirpId !== "string") {
    throw new BadRequestError("Invalid chirp ID");
  }

  const chirp = await getChirp(chirpId);

  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  res.status(200).json(chirp);
}