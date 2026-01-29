"use client";

import { useEffect, useRef } from "react";

export default function ProductDetailClient({ productId }: { productId: string }) {
    const fired = useRef(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Idle trigger: resets on typical interactions.
        const idleMs = 12000;
        let timer: number | undefined;

        const schedule = () => {
            if (fired.current) return;
            if (timer) window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                if (fired.current) return;
                fired.current = true;
                window.dispatchEvent(
                    new CustomEvent("ai:proactive", {
                        detail: { type: "product_idle", productId }
                    })
                );
            }, idleMs);
        };

        const onActivity = () => schedule();

        schedule();

        window.addEventListener("mousemove", onActivity);
        window.addEventListener("keydown", onActivity);
        window.addEventListener("scroll", onActivity, { passive: true } as any);
        window.addEventListener("touchstart", onActivity, { passive: true } as any);

        return () => {
            if (timer) window.clearTimeout(timer);
            window.removeEventListener("mousemove", onActivity);
            window.removeEventListener("keydown", onActivity);
            window.removeEventListener("scroll", onActivity as any);
            window.removeEventListener("touchstart", onActivity as any);
        };
    }, [productId]);

    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
                onClick={() => {
                    window.dispatchEvent(
                        new CustomEvent("ai:proactive", {
                            detail: {
                                type: "open_chat",
                                prefill: "Help me choose a size and fit for this."
                            }
                        })
                    );
                }}
            >
                Ask AI about this
            </button>
            <button
                type="button"
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
                onClick={() => {
                    window.dispatchEvent(
                        new CustomEvent("ai:proactive", {
                            detail: {
                                type: "open_chat",
                                prefill: "Show me similar options."
                            }
                        })
                    );
                }}
            >
                Show alternatives
            </button>
        </div>
    );
}
