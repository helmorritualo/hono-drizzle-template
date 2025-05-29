import { cleanupExpiredTokens } from "@/models/auth.model";

const cleanExpiredToken = async () => {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours

  const runCleanup = async () => {
    console.log("🧹 Starting cleanup of expired refresh tokens...");
    try {
      await cleanupExpiredTokens();
      console.log("🧹 Cleaned up expired refresh tokens");
    } catch (error) {
      console.error("❌ Error cleaning up expired tokens:", error);
    } finally {
      console.log("🧹 Cleanup completed");
    }
  };

  // First execution after 24 hours
  setTimeout(async () => {
    await runCleanup();

    // Then run every 24 hours
    setInterval(runCleanup, TWENTY_FOUR_HOURS);
  }, TWENTY_FOUR_HOURS);
};

export default cleanExpiredToken;