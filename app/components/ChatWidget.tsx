"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  url: string;
  [key: string]: any;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

const ChatWidget = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [sessionId] = useState(uuidv4());

  useEffect(() => {
    const timer = setTimeout(() => {
      sendSystemMessage("page_load");
      setOpen(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const sendSystemMessage = async (event: string) => {
    try {
      const res = await axios.post("http://localhost:8000/chat", {
        session_id: sessionId,
        event,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.message },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:8000/chat", {
        session_id: sessionId,
        query: input,
      });

      const assistantMsg: Message = {
        role: "assistant",
        content: res.data.message,
        products: res.data.recommended_products || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#3C5E73] text-neutral-100 px-4 py-3 rounded-full shadow-lg tracking-wide text-sm hover:bg-neutral-800 transition"
        >
          Rum&Rose Concierge
        </button>
      )}

      {open && (
        <div className="w-95 bg-[#3C5E73] text-neutral-100 rounded-2xl shadow-2xl   overflow-hidden">
          <div className="border-2 border-[#D9AC84] border-dashed m-2 p-2 rounded-lg">
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#D9AC84] border-dashed ">
              <div>
                <p className="text-sm font-serif tracking-wide">Rum&Rose</p>
                <p className="text-xs text-[#D9AC84]">Denim Concierge</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#D9AC84] hover:text-neutral-300 text-sm"
              >
                Close
              </button>
            </div>

            {/* MESSAGES */}
            <div className="h-90 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className="space-y-2">
                  <div
                    className={`max-w-[85%] text-sm leading-relaxed px-4 py-2 rounded-xl ${msg.role === "user"
                      ? "ml-auto bg-neutral-100 text-neutral-900"
                      : "bg-[#F2E8DF] text-[#162840]"
                      }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === "assistant" && msg.products && msg.products.length > 0 && (
                    <div className="space-y-2">
                      {msg.products.map((product) => (
                        <ProductCard key={product.name} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* INPUT */}
            <div className="border-t border-[#D9AC84] border-dashed px-3 py-3 flex gap-2">
              <input
                className="flex-1 bg-[#6387A6] border border-[#D9AC84]  rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-yellow-10  focus:outline-none focus:border-neutral-600"
                placeholder="Ask about fit, fabric, or styling…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 text-sm tracking-wide rounded-lg border border-[#D9AC84] border-dashed bg-[#6387A6] text-white hover:bg-[#53748F] transition relative overflow-hidden"

              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
