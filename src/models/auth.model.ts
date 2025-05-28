import { eq, and, lt, count, gt, desc } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "@/config/database.js";
import { users, refreshTokens } from "@/db/schema/schema";

type User = typeof users.$inferInsert;

export const createUser = async (userData: User) => {
  const { email, password, name } = userData;
  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = {
    email,
    password: hashedPassword,
    name,
  };

  const [user] = await db.insert(users).values(newUser);

  return user;
};

export const findUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
};

export const findUserById = async (id: number) => {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user;
};

export const validatePassword = async (
  plainPassword: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const storeRefreshToken = async (tokenData: any) => {
  const refreshTokenRecord = {
    token: tokenData.token,
    userId: tokenData.userId,
    expiresAt: tokenData.expiresAt,
  };

  await db.insert(refreshTokens).values(refreshTokenRecord);
  return refreshTokenRecord;
};

export const findRefreshToken = async (token: any) => {
  const [refreshToken] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.token, token), eq(refreshTokens.isRevoked, false))
    )
    .limit(1);

  return refreshToken;
};

export const revokeRefreshToken = async (token: any) => {
  await db
    .update(refreshTokens)
    .set({ isRevoked: true })
    .where(eq(refreshTokens.token, token));
};

export const revokeAllUserRefreshTokens = async (userId: number) => {
  await db
    .update(refreshTokens)
    .set({ isRevoked: true })
    .where(eq(refreshTokens.userId, userId));
};

export const getUserRefreshToken = async (userId: number) => {
  const [refreshToken] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.userId, userId),
        eq(refreshTokens.isRevoked, false),
        gt(refreshTokens.expiresAt, new Date())
      )
    )
    .orderBy(desc(refreshTokens.createdAt)) // Get the most recent one
    .limit(1);

  return refreshToken;
};

export const deleteExpiredRefreshToken = async (userId: number) => {
  const now = new Date();
  await db
    .delete(refreshTokens)
    .where(
      and(eq(refreshTokens.userId, userId), lt(refreshTokens.expiresAt, now))
    );
};

export const getActiveRefreshTokensCount = async (userId: number) => {
  const result = await db
    .select({ count: count() })
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.userId, userId), eq(refreshTokens.isRevoked, false))
    );

  return result[0]?.count || 0;
};

export const getActiveRefreshTokensByUser = async (userId: number) => {
  return await db
    .select()
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.userId, userId), eq(refreshTokens.isRevoked, false))
    );
};

export const cleanupExpiredTokens = async () => {
  const now = new Date();
  // Delete expired tokens instead of just marking as revoked
  await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, now));
};
