"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface ChatMessage {
  id: number;
  role: "user" | "assistant" | "error";
  text: string;
}

const AI_THINKING_TEXT = "Tänker...";

export default function ChatPanel() {
  const { authUser, isAuthLoading } = useAuth();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Tjena! Jag kan hjälpa dig med frågor om den här sidan eller ge dig tips på vilka lag du bör satsa på.",
    },
  ]);
  const nextIdRef = useRef(2);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const createMessage = (
    role: ChatMessage["role"],
    text: string,
  ): ChatMessage => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;

    return { id, role, text };
  };

  // Om detta tas bort så ska scrollAnchorRef tas bort längre ner och ovanför
  //   useEffect(() => {
  //     scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, [messages]);

  const getErrorMessageFromResponse = (
    status: number,
    result: unknown,
  ): string => {
    if (
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof result.error === "string" &&
      result.error.trim().length > 0
    ) {
      return result.error;
    }

    if (status === 400) {
      return "Kolla igenom ditt meddelande och försök igen.";
    }

    if (status === 401) {
      return "Din session har gått ut. Vänligen logga in igen.";
    }

    if (status === 429) {
      return "För många förfrågningar. Vänligen vänta ett ögonblick och försök igen.";
    }

    if (status >= 500) {
      return "AI-tjänsten är tillfälligt inte tillgänglig. Försök igen senare.";
    }

    return "Kunde inte få ett svar från AI-assistenten.";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || !authUser) {
      return;
    }

    const userMessage = createMessage("user", trimmedMessage);
    const loadingMessage = createMessage("assistant", AI_THINKING_TEXT);

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorText = getErrorMessageFromResponse(response.status, result);

        setMessages((prev) => {
          const withoutLoading = prev.filter(
            (chatMessage) => chatMessage.id !== loadingMessage.id,
          );
          return [...withoutLoading, createMessage("error", errorText)];
        });
        return;
      }

      const assistantReply =
        typeof result?.reply === "string" && result.reply.trim().length > 0
          ? result.reply
          : "AI-assistenten returnerade ett tomt svar.";

      setMessages((prev) => {
        const withoutLoading = prev.filter(
          (chatMessage) => chatMessage.id !== loadingMessage.id,
        );
        return [...withoutLoading, createMessage("assistant", assistantReply)];
      });
    } catch (error) {
      console.error("Error sending chat message:", error);
      setMessages((prev) => {
        const withoutLoading = prev.filter(
          (chatMessage) => chatMessage.id !== loadingMessage.id,
        );
        return [
          ...withoutLoading,
          createMessage("error", "Nätverksfel. Vänligen försök igen."),
        ];
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">AI-chattbotten</h2>
        <p className="text-sm text-gray-600">Autentiserar...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h2 className="mb-3 text-xl font-bold text-blue-900">AI-chattbotten</h2>
        <p className="mb-4 text-sm text-blue-800">
          Logga in för att chatta med AI-assistenten.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Logga in
          </Link>
          <Link
            href="/register"
            className="rounded bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600"
          >
            Registrera dig
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-1 text-xl font-bold text-gray-900">AI-chattbotten</h2>
      <p className="mb-4 text-sm text-gray-600">
        Ställ frågor om hur du använder sidan eller be om tips på vilka lag du
        bör satsa på.
      </p>

      <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3">
        {messages.map((chatMessage) => {
          const isUser = chatMessage.role === "user";
          const isError = chatMessage.role === "error";

          return (
            <div
              key={chatMessage.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : isError
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                {chatMessage.text}
              </div>
            </div>
          );
        })}
        <div ref={scrollAnchorRef} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="chat-message" className="sr-only">
          Chattmeddelande
        </label>
        <textarea
          id="chat-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Skriv ditt meddelande..."
          rows={3}
          maxLength={2000}
          disabled={isSending}
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{message.length}/2000</p>
          <button
            type="submit"
            disabled={isSending || message.trim().length === 0}
            className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSending ? "Skickar..." : "Skicka"}
          </button>
        </div>
      </form>
    </div>
  );
}
