import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AuthenticatedRequest extends Request {
  user?: any;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generateChatResponse = CatchAsyncError(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { message } = req.body;
      const userId = req.user?._id;

      if (!message) {
        return next(new ErrorHandler("Message is required", 400));
      }

      if (!userId) {
        return next(new ErrorHandler("User not authenticated", 401));
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // 1. Retrieve history from Redis
      const historyKey = `chat_history:${userId}`;
      const historyData = await redis.get(historyKey);
      let history: { role: string; parts: { text: string }[] }[] = [];

      if (historyData) {
        try {
          history = JSON.parse(historyData);
        } catch (err) {
          console.error("Failed to parse chat history from Redis", err);
        }
      }

      // 2. Simple context injection (RAG-lite)
      // Extract a few keywords from the prompt to search the DB
      // A very simple regex search across all courses
      const searchRegex = new RegExp(message.split(" ").filter((w: string) => w.length > 3).join("|"), "i");
      
      const relatedCourses = await CourseModel.find({
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
      } else {
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
      const result = await chatSession.sendMessage(message);
      const responseText = result.response.text();

      // 5. Update history and save back to Redis
      history.push({ role: "user", parts: [{ text: message }] });
      history.push({ role: "model", parts: [{ text: responseText }] });
      
      // Keep only the last 20 messages (10 turns) to prevent exceeding token limits or Redis memory
      if (history.length > 20) {
        history = history.slice(history.length - 20);
      }

      await redis.set(historyKey, JSON.stringify(history), "EX", 24 * 60 * 60); // Expire in 24 hours

      res.status(200).json({
        success: true,
        message: responseText,
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
