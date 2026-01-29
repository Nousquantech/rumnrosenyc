"use client";

import axios from "axios";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { ProductCard, type ProductLike } from "./ProductCard";

type ChatRole = "user" | "assistant";

type ChatMessage = {
    id: string;
    role: ChatRole;
    content: string;
    recommendedProducts?: ProductLike[];
    followUpQuestion?: string;
};

type ProactiveEventDetail =
    | { type: "page_load"; hint?: string }
    | { type: "product_idle"; productId?: string }
    | { type: "open_chat"; prefill?: string };

function getApiBaseUrl(): string {
    const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (configured && configured.trim()) return configured.trim();
    return "http://localhost:8000";
}

function normalizeApiUrl(path: string): string {
    const base = getApiBaseUrl().replace(/\/$/, "");
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `${base}${suffix}`;
}

function getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "";

    const key = "ai_retail_session_id";
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;

    const created = uuidv4();
    window.sessionStorage.setItem(key, created);
    return created;
}

function toProductLike(input: unknown): ProductLike | null {
    if (!input || typeof input !== "object") return null;
    const maybe = input as Record<string, unknown>;

    const id = typeof maybe.id === "string" ? maybe.id : undefined;
    if (!id) return null;

    const name = typeof maybe.name === "string" && maybe.name.trim() ? maybe.name : "Recommended item";

    const price =
        typeof maybe.price === "number"
            ? maybe.price
            : typeof maybe.price === "string"
                ? Number.parseFloat(maybe.price)
                : 0;

    const fit = typeof maybe.fit === "string" ? maybe.fit : undefined;
    const wash = typeof maybe.wash === "string" ? maybe.wash : undefined;

    return {
        id,
        name,
        price,
        fit,
        wash
    };
}

export default function ChatWidget() {
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const [sessionId, setSessionId] = useState<string>("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);

    const [inputFocused, setInputFocused] = useState(false);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const proactiveSentForPath = useRef<Set<string>>(new Set());

    const apiUrl = useMemo(() => normalizeApiUrl("/chat"), []);

    useEffect(() => {
        const id = getOrCreateSessionId();
        setSessionId(id);

        // Restore prior chat for this browser session (nice UX, low complexity).
        if (typeof window === "undefined") return;
        const saved = window.localStorage.getItem(`chat_history_${id}`);
        if (!saved) return;
        try {
            const parsed = JSON.parse(saved) as ChatMessage[];
            if (Array.isArray(parsed)) setMessages(parsed);
        } catch {
            // ignore parse errors
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!sessionId) return;
        window.localStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(messages));
    }, [messages, sessionId]);

    useEffect(() => {
        // Auto-open only once per browser session.
        if (typeof window === "undefined") return;

        const key = "ai_retail_chat_auto_opened";
        const already = window.sessionStorage.getItem(key);
        if (already) return;

        window.sessionStorage.setItem(key, "1");
        const t = window.setTimeout(() => {
            if (!inputFocused) setIsOpen(true);
        }, 1200);
        return () => window.clearTimeout(t);
    }, [inputFocused]);

    useEffect(() => {
        setUnreadCount(0);
    }, [pathname]);

    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages.length, isOpen]);

    async function sendQuery(query: string, options?: { isProactive?: boolean }) {
        const trimmed = query.trim();
        if (!trimmed) return;

        const isProactive = Boolean(options?.isProactive);

        if (!isProactive) {
            setMessages((prev) => [
                ...prev,
                { id: uuidv4(), role: "user", content: trimmed }
            ]);
        }

        setIsSending(true);
        try {
            const res = await axios.post(
                apiUrl,
                { query: trimmed, session_id: sessionId || undefined },
                { headers: { "Content-Type": "application/json" } }
            );

            const data = res.data as any;

            const newSessionId =
                (typeof data?.session_id === "string" && data.session_id) || sessionId;

            if (newSessionId && typeof window !== "undefined") {
                setSessionId(newSessionId);
                window.sessionStorage.setItem("ai_retail_session_id", newSessionId);
            }

            const answerText =
                (typeof data?.message === "string" && data.message) ||
                (typeof data?.answer === "string" && data.answer) ||
                "";

            const rawRecommended =
                Array.isArray(data?.recommended_products) ? data.recommended_products : [];

            const recommendedProducts = rawRecommended
                .map(toProductLike)
                .filter(Boolean) as ProductLike[];

            const followUp =
                typeof data?.follow_up_question === "string"
                    ? data.follow_up_question
                    : null;

            setMessages((prev) => [
                ...prev,
                {
                    id: uuidv4(),
                    role: "assistant",
                    content: answerText || "—",
                    recommendedProducts: recommendedProducts.length
                        ? recommendedProducts
                        : undefined,
                    followUpQuestion: followUp || undefined
                }
            ]);

            if (!isOpen) setUnreadCount((c) => c + 1);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: uuidv4(),
                    role: "assistant",
                    content:
                        "I’m having trouble connecting right now. Try again in a moment."
                }
            ]);
            if (!isOpen) setUnreadCount((c) => c + 1);
        } finally {
            setIsSending(false);
        }
    }

    function sendFollowUp(text: string) {
        setInput("");
        void sendQuery(text);
    }

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handler = (evt: Event) => {
            const custom = evt as CustomEvent<ProactiveEventDetail>;
            const detail = custom.detail;
            if (!detail) return;

            // One proactive message per page.
            const key = `proactive:${pathname || ""}`;
            if (proactiveSentForPath.current.has(key)) return;

            // Never interrupt typing.
            if (inputFocused || input.trim().length > 0) return;

            if (detail.type === "open_chat") {
                setIsOpen(true);
                if (detail.prefill) setInput(detail.prefill);
                return;
            }

            proactiveSentForPath.current.add(key);

            if (detail.type === "page_load") {
                const t = window.setTimeout(() => {
                    if (inputFocused || input.trim().length > 0) return;
                    void sendQuery(
                        detail.hint ||
                        "If you’d like, I can help you pick a fit and size.",
                        { isProactive: true }
                    );
                }, 1400);
                return () => window.clearTimeout(t);
            }

            if (detail.type === "product_idle") {
                const assistantText = "Want help choosing the right fit or size?";

                // Add a local, non-spammy assistant hint.
                setMessages((prev) => [
                    ...prev,
                    {
                        id: uuidv4(),
                        role: "assistant",
                        content: assistantText
                    }
                ]);

                if (!isOpen) setUnreadCount((c) => c + 1);
                return;
            }
        };

        window.addEventListener("ai:proactive", handler as EventListener);
        return () => window.removeEventListener("ai:proactive", handler as EventListener);
    }, [pathname, inputFocused, input, isOpen]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(true);
                        setUnreadCount(0);
                    }}
                    className="relative rounded-full bg-[#3C5E73] px-4 py-3 text-sm tracking-wide text-neutral-100 shadow-lg transition hover:bg-neutral-800"
                    aria-label="Open chat"
                >
                    Rum&Rose Concierge
                    {unreadCount > 0 ? (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D9AC84] px-1 text-[11px] font-bold text-[#162840]">
                            {unreadCount}
                        </span>
                    ) : null}
                </button>
            ) : (
                <div className="w-[calc(100vw-3rem)] max-w-[420px] overflow-hidden rounded-2xl bg-[#3C5E73] text-neutral-100 shadow-2xl">
                    <div className="m-2 rounded-lg border-2 border-dashed border-[#D9AC84] p-2">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-dashed border-[#D9AC84] px-4 py-3">
                            <div>
                                <p className="text-sm font-serif tracking-wide">Rum&Rose</p>
                                <p className="text-xs text-[#D9AC84]">Denim Concierge</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-[#D9AC84] transition hover:text-neutral-200"
                                aria-label="Close chat"
                            >
                                Close
                            </button>
                        </div>

                        {/* MESSAGES */}
                        <div
                            ref={scrollRef}
                            className="h-[420px] space-y-4 overflow-y-auto px-4 py-4"
                        >
                            {messages.length === 0 ? (
                                <div className="max-w-[85%] rounded-xl bg-[#F2E8DF] px-4 py-3 text-sm text-[#162840]">
                                    Ask about fit, fabric, or styling.
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {[
                                            "Help me choose an everyday fit",
                                            "What size should I get?",
                                            "Show me black denim options"
                                        ].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => sendFollowUp(s)}
                                                className="rounded-full border border-dashed border-[#D9AC84] bg-[#F2E8DF] px-3 py-1 text-xs text-[#162840] transition hover:opacity-90"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {messages.map((m) => (
                                <div key={m.id} className="space-y-2">
                                    <div
                                        className={
                                            m.role === "user"
                                                ? "ml-auto max-w-[85%] rounded-xl bg-neutral-100 px-4 py-2 text-sm leading-relaxed text-neutral-900"
                                                : "mr-auto max-w-[85%] rounded-xl bg-[#F2E8DF] px-4 py-2 text-sm leading-relaxed text-[#162840]"
                                        }
                                    >
                                        {m.content}
                                    </div>

                                    {m.role === "assistant" && m.recommendedProducts?.length ? (
                                        <div className="space-y-2">
                                            {m.recommendedProducts.map((p) => (
                                                <ProductCard key={p.id} product={p} variant="chat" />
                                            ))}
                                        </div>
                                    ) : null}

                                    {m.role === "assistant" && m.followUpQuestion ? (
                                        <button
                                            type="button"
                                            onClick={() => sendFollowUp(m.followUpQuestion as string)}
                                            className="mr-auto rounded-full border border-dashed border-[#D9AC84] bg-[#6387A6] px-3 py-1 text-xs tracking-wide text-neutral-100 transition hover:bg-[#53748F]"
                                        >
                                            {m.followUpQuestion}
                                        </button>
                                    ) : null}
                                </div>
                            ))}

                            {isSending ? (
                                <div className="mr-auto max-w-[85%] rounded-xl bg-[#F2E8DF] px-4 py-2 text-sm text-[#162840]">
                                    Thinking…
                                </div>
                            ) : null}
                        </div>

                        {/* INPUT */}
                        <form
                            className="flex gap-2 border-t border-dashed border-[#D9AC84] px-3 py-3"
                            onSubmit={(e) => {
                                e.preventDefault();
                                void sendQuery(input);
                                setInput("");
                            }}
                        >
                            <input
                                className="flex-1 rounded-lg border border-[#D9AC84] bg-[#6387A6] px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-200/70 focus:outline-none focus:border-neutral-100"
                                placeholder="Ask about fit, fabric, or styling…"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                disabled={isSending}
                            />
                            <button
                                type="submit"
                                disabled={isSending || input.trim().length === 0}
                                className="relative overflow-hidden rounded-lg border border-dashed border-[#D9AC84] bg-[#6387A6] px-4 py-2 text-sm tracking-wide text-white transition hover:bg-[#53748F] disabled:opacity-50"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
