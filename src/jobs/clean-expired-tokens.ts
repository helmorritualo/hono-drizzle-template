import { cleanupExpiredTokens } from "@/models/auth.model";

const cleanExpiredToken = async () => {
  // Setup cleanup for expired refresh tokens (run once a day)
  setInterval(async () => {
    console.log("🧹 Starting cleanup of expired refresh tokens...");
    try {
      await cleanupExpiredTokens();
      console.log("🧹 Cleaned up expired refresh tokens");
    } catch (error) {
      console.error("❌ Error cleaning up expired tokens:", error);
    } finally {
      console.log("🧹 Cleanup completed");
    }
  }, 24 * 60 * 60 * 1000); // Once a day (24 hours in milliseconds)

  // Initial cleanup when the job starts
  try {
    await cleanupExpiredTokens();
    console.log("🧹 Initial cleanup of expired refresh tokens completed");
  } catch (error) {
    console.error("❌ Error during initial token cleanup:", error);
  }
};

export default cleanExpiredToken;
