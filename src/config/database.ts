import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { DATABASE_URL } from "@/config/env";

const poolConnection = mysql.createPool({
  uri: DATABASE_URL,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

export const databaseConnection = async () => {
  try {
    const connection = await poolConnection.getConnection();
    console.log("Database connection established successfully.");
    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

export const db = drizzle(poolConnection);
