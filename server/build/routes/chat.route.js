"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("../controllers/chat.controller");
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controllers/user.controller");
const chatRouter = express_1.default.Router();
chatRouter.post("/chat", user_controller_1.updateAccessToken, auth_1.isAuthenticated, chat_controller_1.generateChatResponse);
exports.default = chatRouter;
