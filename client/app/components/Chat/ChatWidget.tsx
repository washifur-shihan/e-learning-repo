"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSendMessageMutation } from "../../../redux/features/chat/chatApi";
import { AiOutlineMessage, AiOutlineClose, AiOutlineSend } from "react-icons/ai";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { user } = useSelector((state: any) => state.auth);
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from local storage on mount
  useEffect(() => {
    if (user) {
      const savedMessages = localStorage.getItem(`chat_history_${user._id}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      const savedOpenState = localStorage.getItem(`chat_isOpen_${user._id}`);
      if (savedOpenState === "true") {
        setIsOpen(true);
      }
    }
  }, [user]);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`chat_history_${user._id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  const toggleChat = (state: boolean) => {
    setIsOpen(state);
    if (user) {
      localStorage.setItem(`chat_isOpen_${user._id}`, String(state));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await sendMessage({ message: userMessage.text }).unwrap();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: res.message,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to send message", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I am having trouble connecting right now. Please try again later.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  if (!user) return null; // Only show for logged in users

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-80 sm:w-96 flex flex-col mb-4 overflow-hidden" style={{ height: "450px" }}>
          {/* Header */}
          <div className="bg-blue-600 p-3 text-white flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <AiOutlineMessage /> AI Assistant
            </h3>
            <button onClick={() => toggleChat(false)} className="hover:text-gray-200">
              <AiOutlineClose size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
                Hi {user.name}! How can I help you today?
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white self-end rounded-br-none"
                    : "bg-gray-100 dark:bg-slate-800 text-black dark:text-white self-start rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 dark:bg-slate-800 text-black dark:text-white p-3 rounded-lg text-sm self-start rounded-bl-none flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-black dark:text-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AiOutlineSend size={20} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => toggleChat(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center"
        >
          <AiOutlineMessage size={28} />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
