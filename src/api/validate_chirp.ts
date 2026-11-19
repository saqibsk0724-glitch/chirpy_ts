import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";

type parameters = {
  body: string;
};

const profaneWords = ["kerfuffle", "sharbert", "fornax"];

export async function handlerValidateChirp(
  req: Request,
  res: Response
): Promise<void> {
  const params = req.body as parameters;

  // Check that body is a string
  if (typeof params?.body !== "string") {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  // Check the 140-character limit first
  if(params.body.length > 140){
    throw new BadRequestError(
        "Chirp is too long. Max length is 140"
    )
  }

  // Split the Chirp into individual words
  const words = params.body.split(" ");

  // Replace profane words
  const cleanedWords = words.map((word) => {
    if (profaneWords.includes(word.toLowerCase())) {
      return "****";
    }

    return word;
  });

  // Join the words back together
  const cleanedBody = cleanedWords.join(" ");

  res.status(200).json({ cleanedBody });
}