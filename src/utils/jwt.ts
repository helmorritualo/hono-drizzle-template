import { sign, verify } from "hono/jwt";
import { v4 as uuidv4 } from "uuid";
import {
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_JWT_SECRET,
} from "@/config/env";

export const generateAccessToken = async (payload: any) => {
  const now = Math.floor(Date.now() / 1000);
  const expirySeconds = parseTimeToSeconds(ACCESS_TOKEN_EXPIRY || "15m");
  const exp = now + (expirySeconds > 0 ? expirySeconds : 15 * 60); // Default 15 minutes

  const tokenPayload = {
    ...payload,
    exp,
    iat: now,
    type: "access",
  };

  return await sign(tokenPayload, JWT_SECRET as string);
};

export const generateRefreshToken = async (payload: any) => {
  const now = Math.floor(Date.now() / 1000);
  const expirySeconds = parseTimeToSeconds(REFRESH_TOKEN_EXPIRY || "7d");
  const exp = now + (expirySeconds > 0 ? expirySeconds : 7 * 24 * 60 * 60); // Default 7 days

  const tokenPayload = {
    ...payload,
    jti: uuidv4(),
    exp,
    iat: now,
    type: "refresh",
  };

  return await sign(tokenPayload, REFRESH_JWT_SECRET as string);
};

export const verifyAccessToken = async (token: string) => {
  try {
    const payload = await verify(token, JWT_SECRET as string);
    if (payload.type !== "access") {
      throw new Error("Invalid token type");
    }
    return payload;
  } catch (error) {
    throw new Error("Invalid access token");
  }
};

export const verifyRefreshToken = async (token: string) => {
  try {
    const payload = await verify(token, REFRESH_JWT_SECRET as string);
    if (payload.type !== "refresh") {
      throw new Error("Invalid token type");
    }
    return payload;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

export const parseTimeToSeconds = (timeString: string | undefined): number => {
  if (!timeString) return 0;

  const timePattern = /^(\d+)([smhd])$/;
  const match = timeString.match(timePattern);

  if (!match) {
    const numericValue = Number(timeString);
    return isNaN(numericValue) ? 0 : numericValue;
  }

  const [, value, unit] = match;
  if (!value) return 0;
  const numValue = parseInt(value, 10);

  switch (unit) {
    case "s":
      return numValue; // seconds
    case "m":
      return numValue * 60; // minutes to seconds
    case "h":
      return numValue * 60 * 60; // hours to seconds
    case "d":
      return numValue * 24 * 60 * 60; // days to seconds
    default:
      return 0;
  }
};

export const checkTokenExpiry = (expiresAt: Date) => {
  const now = new Date();
  const hoursUntilExpiry =
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  return {
    hoursLeft: hoursUntilExpiry,
    isExpired: hoursUntilExpiry <= 0,
    isExpiringSoon: hoursUntilExpiry < 24, // Less than 24 hours
    daysLeft: hoursUntilExpiry / 24,
  };
};

export const getTokenExpiration = (type = "access") => {
  const now = new Date();
  const expiry = type === "access" ? ACCESS_TOKEN_EXPIRY : REFRESH_TOKEN_EXPIRY;
  const expirySeconds = parseTimeToSeconds(expiry);

  // Fallback defaults if parsing fails
  const defaultSeconds = type === "access" ? 15 * 60 : 7 * 24 * 60 * 60; // 15 minutes or 7 days
  const finalExpirySeconds = expirySeconds > 0 ? expirySeconds : defaultSeconds;

  return new Date(now.getTime() + finalExpirySeconds * 1000);
};
