import express from "express";
import { generateChatResponse } from "../controllers/chat.controller";
import { isAuthenticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controller";

const chatRouter = express.Router();

chatRouter.post("/chat", updateAccessToken, isAuthenticated, generateChatResponse);

export default chatRouter;
