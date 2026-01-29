"use client";

export default function OpenChatButton({
    prefill,
    className,
    children
}: {
    prefill?: string;
    className: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            className={className}
            onClick={() => {
                window.dispatchEvent(
                    new CustomEvent("ai:proactive", {
                        detail: { type: "open_chat", prefill }
                    })
                );
            }}
        >
            {children}
        </button>
    );
}
