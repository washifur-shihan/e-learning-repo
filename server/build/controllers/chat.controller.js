"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChatResponse = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const course_model_1 = __importDefault(require("../models/course.model"));
const redis_1 = require("../utils/redis");
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
exports.generateChatResponse = (0, catchAsyncErrors_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { message } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!message) {
            return next(new ErrorHandler_1.default("Message is required", 400));
        }
        if (!userId) {
            return next(new ErrorHandler_1.default("User not authenticated", 401));
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // 1. Retrieve history from Redis
        const historyKey = `chat_history:${userId}`;
        const historyData = yield redis_1.redis.get(historyKey);
        let history = [];
        if (historyData) {
            try {
                history = JSON.parse(historyData);
            }
            catch (err) {
                console.error("Failed to parse chat history from Redis", err);
            }
        }
        // 2. Simple context injection (RAG-lite)
        // Extract a few keywords from the prompt to search the DB
        // A very simple regex search across all courses
        const searchRegex = new RegExp(message.split(" ").filter((w) => w.length > 3).join("|"), "i");
        const relatedCourses = yield course_model_1.default.find({
            $or: [
                { name: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
            ]
        })
            .select("name description price level categories tags")
            .limit(3)
            .lean();
        let contextStr = "Here is some context about our available courses:\n\n";
        if (relatedCourses.length > 0) {
            relatedCourses.forEach((course) => {
                contextStr += `Course Name: ${course.name}\n`;
                contextStr += `Description: ${course.description}\n`;
                contextStr += `Price: $${course.price}\n`;
                contextStr += `Level: ${course.level}\n`;
                contextStr += `Categories: ${course.categories}\n\n`;
            });
        }
        else {
            contextStr += "No specific courses matched the user's query.\n\n";
        }
        const systemInstruction = `You are a helpful and knowledgeable AI assistant for our e-learning platform. 
      Your goal is to help students find courses, understand course material, and navigate the platform.
      Use the following context from our database to answer the user's questions if relevant:
      
      ${contextStr}
      
      If the user asks something unrelated to e-learning or the platform, politely decline and steer the conversation back to our courses. Keep responses concise and engaging.`;
        // 3. Initialize chat session
        const chatSession = model.startChat({
            history,
            systemInstruction,
        });
        // 4. Generate response
        const result = yield chatSession.sendMessage(message);
        const responseText = result.response.text();
        // 5. Update history and save back to Redis
        history.push({ role: "user", parts: [{ text: message }] });
        history.push({ role: "model", parts: [{ text: responseText }] });
        // Keep only the last 20 messages (10 turns) to prevent exceeding token limits or Redis memory
        if (history.length > 20) {
            history = history.slice(history.length - 20);
        }
        yield redis_1.redis.set(historyKey, JSON.stringify(history), "EX", 24 * 60 * 60); // Expire in 24 hours
        res.status(200).json({
            success: true,
            message: responseText,
        });
    }
    catch (error) {
        console.error("Gemini API Error:", error);
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
