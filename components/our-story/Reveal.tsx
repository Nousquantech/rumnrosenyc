"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type RevealProps = {
    children: ReactNode;
    className?: string;
};

export function Reveal({ children, className }: RevealProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry) return;
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.12 }
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={className ?? ""}>
            <div
                className={
                    "will-change-transform transition-[opacity,transform] duration-700 ease-out " +
                    (isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")
                }
            >
                {children}
            </div>
        </div>
    );
}