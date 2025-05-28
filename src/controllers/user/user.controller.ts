import { findUserById } from "@/models/auth.model";
import { NotFoundError } from "@/utils/custom-error";
import { Context } from "hono";

export const getUserProfile = async (c: Context) => {
  try {
    const userId = c.get("userId");
    const user = await findUserById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return c.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(
      `An unexpected error occurred: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
