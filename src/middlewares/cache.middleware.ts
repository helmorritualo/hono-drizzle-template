import cacheStrategies from "@/config/cache";
import { Context, Next } from "hono";

// This middleware applies different caching strategies based on the request path and method
const cachingMiddleware = () => {
  return async (c: Context, next: Next) => {
    const path = c.req.path;
    const hasAuth = c.req.header("Authorization");
    const method = c.req.method;

    // Only cache GET requests
    if (method !== 'GET') {
      return next();
    }

    // Don't cache authenticated requests to sensitive endpoints
    if (hasAuth && (path.includes("/admin") || path.includes("/auth"))) {
      return next();
    }

    // Apply appropriate caching strategy based on route patterns
    // Adjust these patterns based on your application's structure
    if (path.includes("/static") || path.includes("/public") || path.includes("/assets")) {
      return cacheStrategies.static(c, next);
    }

    // Cache dynamic content that changes infrequently
    else if (path.includes("/live") || path.includes("/notifications") || path.includes("/realtime")) {
      return cacheStrategies.realTime(c, next);
    }

     // Cache user-specific routes with a short cache duration
     // e.g., user profile, settings, etc.
    else if (hasAuth && (path.includes("/users") || path.includes("/users/profile"))) {
      return cacheStrategies.userSpecific(c, next);
    }

    /**
     * Add more specific caching rules here
     * For example, you might want to cache API responses that change infrequently
     * e.g., product listings, blog posts, etc.
     * This is a generic example; adjust based on your application's needs
     */
    else if (path.includes("/posts")) {
      return cacheStrategies.dynamic(c, next);
    }
    else {
     /**
      * Default to dynamic caching for all other routes
      * e.g., API endpoints that return data like search results, user data, etc.
      */
      return cacheStrategies.dynamic(c, next);
    }
  };
};

export default cachingMiddleware;