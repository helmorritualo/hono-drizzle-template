import { cache } from 'hono/cache'

const cacheStrategies = {
  // Static content - long cache
  // e.g., images, stylesheets, scripts
  static: cache({
    cacheName: "static-content",
    cacheControl: "public, max-age=86400", // 24 hours
    vary: ["Accept-Encoding"]
  }),

  // Dynamic but stable data - medium cache
  // e.g., API responses that change infrequently
  dynamic: cache({
    cacheName: "dynamic-content",
    cacheControl: "public, max-age=1800", // 30 minutes
    vary: ["Accept-Encoding", "Accept"]
  }),

  // User-specific data - short cache
  // e.g., user profiles, settings
  userSpecific: cache({
    cacheName: "user-content",
    cacheControl: "private, max-age=300", // 5 minutes
    vary: ["Authorization", "Accept-Encoding"]
  }),

  // Real-time data - no cache
  // e.g., live updates, notifications
  realTime: cache({
    cacheName: "no-cache",
    cacheControl: "no-cache, no-store, must-revalidate"
  })
};

export default cacheStrategies;