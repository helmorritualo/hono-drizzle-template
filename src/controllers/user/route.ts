import { Hono } from "hono";
import { getUserProfile } from "./user.controller";
import { authMiddleware } from "@/middlewares/authentication";

const userRouter = new Hono();
userRouter.get("/profile", authMiddleware, getUserProfile);

export default userRouter;
