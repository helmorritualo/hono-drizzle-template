import { config } from "dotenv";

config({ path: ".env" });
export const {
     PORT,
     JWT_SECRET,
     NODE_ENV,
     DATABASE_URL,
     REFRESH_JWT_SECRET,
     ACCESS_TOKEN_EXPIRY,
     REFRESH_TOKEN_EXPIRY,
     COOKIE_SECRET
} = process.env;
