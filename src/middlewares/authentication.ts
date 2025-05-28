import { Context, Next } from "hono";
import { verifyAccessToken } from "@/utils/jwt";
import { getAccessTokenFromCookie } from "@/utils/cookies";
import { findUserById } from "@/models/auth.model";
import { NotFoundError, ForbiddenError, InternalServerError } from "@/utils/custom-error";

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const accessToken = getAccessTokenFromCookie(c);

    if (!accessToken) {
      throw new NotFoundError("Access token not found");
    }

    // Verify access token
    let payload;
    try {
      payload = await verifyAccessToken(accessToken);
    } catch (error) {
      throw new ForbiddenError("Invalid access token");
    }

    // Check if user still exists or is active
    const user = await findUserById(payload.userId as number);
    if (!user || !user.isActive) {
      throw new NotFoundError("User not found or inactive");
    }

    // Set user info in context for use in controllers
    c.set("userId", user.id);

    await next();
  } catch (error) {
     if (error instanceof NotFoundError || error instanceof ForbiddenError) {
       throw error;
     }
     throw new InternalServerError("Authentication failed");
  }
};