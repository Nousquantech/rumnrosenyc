"use client";

import { useEffect } from "react";

export default function PageProactiveTrigger({
    type,
    hint,
    productId,
    delayMs
}: {
    type: "page_load" | "product_idle";
    hint?: string;
    productId?: string;
    delayMs?: number;
}) {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const fire = () => {
            window.dispatchEvent(
                new CustomEvent("ai:proactive", {
                    detail: { type, hint, productId }
                })
            );
        };

        if (typeof delayMs === "number") {
            const t = window.setTimeout(fire, Math.max(0, delayMs));
            return () => window.clearTimeout(t);
        }

        fire();
    }, [type, hint, productId, delayMs]);

    return null;
}
