import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/authentication";
import {
  login,
  register,
  refreshToken,
  logout,
  logoutAll,
} from "./auth.controller";

const authRouter = new Hono();

//public routes
authRouter.post("/auth/login", login);
authRouter.post("/auth/register", register);
authRouter.post("/auth/refresh-token", refreshToken);

// protected routes
authRouter.post("/auth/logout", authMiddleware, logout);
authRouter.post("/auth/logout-all", authMiddleware, logoutAll);

export default authRouter;
