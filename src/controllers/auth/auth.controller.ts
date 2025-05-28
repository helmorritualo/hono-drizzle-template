import {
  createUser,
  findUserByEmail,
  findUserById,
  validatePassword,
  storeRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  getUserRefreshToken,
  deleteExpiredRefreshToken,
} from "@/models/auth.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getTokenExpiration,
  checkTokenExpiry,
} from "@/utils/jwt";
import {
  setTokenCookies,
  getRefreshTokenFromCookie,
  clearTokenCookies,
} from "@/utils/cookies";
import { Context } from "hono";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "@/utils/custom-error";

export const register = async (c: Context) => {
  try {
    const { email, password, name } = await c.req.json();

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestError("User already exists");
    }
    await createUser({ email, password, name });

    const user = await findUserByEmail(email);
    if (!user) {
      throw new BadRequestError("Failed to create user");
    }

    // Generate tokens for new user
    const accessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = await generateRefreshToken({
      userId: user.id,
    });

    // Store refresh token in database
    await storeRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: getTokenExpiration("refresh"),
    });

    // Set cookies
    setTokenCookies(c, accessToken, refreshToken);

    return c.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      201
    );
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(
      `An unexpected error occurred during registration: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();

    const user = await findUserByEmail(email);
    if (!user) {
      throw new BadRequestError("Invalid email");
    }

    const isValidPassword = await validatePassword(password, user.password);
    if (!isValidPassword) {
      throw new BadRequestError("Invalid password");
    }

    if (!user.isActive) {
      throw new ForbiddenError("Your account is currently banned");
    }

    // Check if user has an existing valid refresh token
    let refreshToken = null;
    const existingRefreshToken = await getUserRefreshToken(user.id);

    if (existingRefreshToken) {
      // Use existing refresh token
      refreshToken = existingRefreshToken.token;
    } else {
      // Clean up any expired tokens first
      await deleteExpiredRefreshToken(user.id);

      // Generate new refresh token only if none exists
      refreshToken = await generateRefreshToken({
        userId: user.id,
      });

      await storeRefreshToken({
        token: refreshToken,
        userId: user.id,
        expiresAt: getTokenExpiration("refresh"),
      });
    }

    const accessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    setTokenCookies(c, accessToken, refreshToken);

    return c.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof ForbiddenError) {
      throw error;
    }
    throw new Error(
      `An unexpected error occurred during login: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const refreshToken = async (c: Context) => {
  try {
    const refreshToken = getRefreshTokenFromCookie(c);

    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required");
    }

    let payload;
    try {
      payload = await verifyRefreshToken(refreshToken);
    } catch (error) {
      clearTokenCookies(c);
      throw new BadRequestError("Invalid refresh token");
    }

    // Check if token exists in database and is not revoked
    const storedToken = await findRefreshToken(refreshToken);
    if (!storedToken) {
      clearTokenCookies(c);
      throw new BadRequestError("Refresh token not found");
    }

    if (new Date() > new Date(storedToken.expiresAt)) {
      await revokeRefreshToken(refreshToken);
      clearTokenCookies(c);
      throw new BadRequestError("Refresh token has expired");
    }

    const user = await findUserById(payload.userId as number);
    if (!user || !user.isActive) {
      await revokeRefreshToken(refreshToken);
      clearTokenCookies(c);
      throw new ForbiddenError("Your account is currently banned");
    }

    const newAccessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    // Check if refresh token is close to expiring (e.g., less than 24 hours left)
    const expiryInfo = checkTokenExpiry(new Date(storedToken.expiresAt));

    let finalRefreshToken = refreshToken;

    if (expiryInfo.isExpiringSoon) {
      // Delete the old expired/expiring token
      await revokeRefreshToken(refreshToken);

      // Generate new refresh token
      const newRefreshToken = await generateRefreshToken({
        userId: user.id,
      });

      // Store new refresh token in database
      await storeRefreshToken({
        token: newRefreshToken,
        userId: user.id,
        expiresAt: getTokenExpiration("refresh"),
      });

      finalRefreshToken = newRefreshToken;
    }

    setTokenCookies(c, newAccessToken, finalRefreshToken);

    return c.json({
      success: true,
      message: "Tokens refreshed successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    clearTokenCookies(c);
    if (error instanceof BadRequestError || error instanceof ForbiddenError) {
      throw error;
    }
    throw new Error(
      `An unexpected error occurred during token refresh: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const logout = async (c: Context) => {
  try {
    const refreshToken = getRefreshTokenFromCookie(c);

    if (refreshToken) {
      // Revoke the refresh token in database
      await revokeRefreshToken(refreshToken);
    }

    clearTokenCookies(c);

    return c.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    // Clear cookies even if there's an error
    clearTokenCookies(c);
    return c.json({ success: true, message: "Logged out successfully" });
  }
};

export const logoutAll = async (c: Context) => {
  try {
    const userId = c.get("userId");

    if (userId) {
      // Revoke all refresh tokens for this user
      await revokeAllUserRefreshTokens(userId);
    }

    clearTokenCookies(c);
    return c.json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    clearTokenCookies(c);
    return c.json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  }
};
