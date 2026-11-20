
import { describe, it, expect, beforeAll } from "vitest";
import { BadRequestError } from "./api/errors.js";
import {
  hashPassword,
  checkPasswordHash,
  makeJWT,
  validateJWT,
  extractBearerToken,
} from "./auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";

  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for the wrong password", async () => {
    const result = await checkPasswordHash(password1, hash2);
    expect(result).toBe(false);
  });
});

describe("JWT", () => {
  const userID = "user-123";
  const secret = "test-secret";

  it("should create and validate a JWT", () => {
    const token = makeJWT(userID, 3600, secret);

    const result = validateJWT(token, secret);

    expect(result).toBe(userID);
  });

  it("should reject an expired JWT", () => {
    const token = makeJWT(userID, -1, secret);

    expect(() => validateJWT(token, secret)).toThrow();
  });

  it("should reject a JWT signed with the wrong secret", () => {
    const token = makeJWT(userID, 3600, secret);

    expect(() => validateJWT(token, "wrong-secret")).toThrow();
  });
});



describe("Bearer Token", () => {
  it("should extract a token from a valid Bearer header", () => {
    const result = extractBearerToken("Bearer abc123");

    expect(result).toBe("abc123");
  });

  it("should handle surrounding whitespace", () => {
    const result = extractBearerToken("  Bearer   abc123  ");

    expect(result).toBe("abc123");
  });

  it("should throw BadRequestError when the header is missing", () => {
    expect(() => extractBearerToken(undefined)).toThrow(BadRequestError);
  });

  it("should throw BadRequestError for an invalid scheme", () => {
    expect(() => extractBearerToken("Basic abc123")).toThrow(BadRequestError);
  });

  it("should throw BadRequestError when the token is empty", () => {
    expect(() => extractBearerToken("Bearer")).toThrow(BadRequestError);
  });
});
