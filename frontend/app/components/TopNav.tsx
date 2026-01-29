"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        // Close when route changes.
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    useEffect(() => {
        // Hide on scroll down, show on scroll up.
        // Uses a small threshold to avoid jitter.
        let lastY = typeof window !== "undefined" ? window.scrollY : 0;
        let ticking = false;

        const update = () => {
            const y = window.scrollY;
            const delta = y - lastY;

            // Always show near the top.
            if (y <= 8) {
                setHidden(false);
                lastY = y;
                return;
            }

            // Ignore tiny scroll movements.
            if (Math.abs(delta) < 10) {
                lastY = y;
                return;
            }

            if (delta > 0) {
                // Scrolling down
                setHidden(true);
                setOpen(false);
            } else {
                // Scrolling up
                setHidden(false);
            }

            lastY = y;
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                ticking = false;
                update();
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={
                "fixed inset-x-0 top-0 z-40 border-b border-neutral-800/70 bg-[#0B1726]/80 backdrop-blur " +
                "transition-transform duration-300 ease-out will-change-transform " +
                (hidden ? "-translate-y-full" : "translate-y-0")
            }
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <Link
                    href="/"
                    className="font-serif text-lg tracking-tight text-neutral-100"
                    aria-label="Rum&Rose home"
                >
                    Rum&Rose
                </Link>

                <nav className="hidden items-center gap-6 text-sm text-neutral-200 md:flex" aria-label="Primary">
                    <Link href="/collection" className="hover:text-white">
                        Collection
                    </Link>
                    <Link href="/products" className="hover:text-white">
                        Denim
                    </Link>
                    <Link href="/contact" className="hover:text-white">
                        Contact
                    </Link>
                </nav>

                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-neutral-700/60 bg-[#0B1726]/40 px-3 py-2 text-sm text-neutral-100 transition hover:bg-[#0B1726]/60 md:hidden"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    aria-controls="mobile-nav"
                    onClick={() => setOpen((v) => !v)}
                >
                    <span className="sr-only">Menu</span>
                    <span className="font-medium">Menu</span>
                </button>
            </div>

            <div
                id="mobile-nav"
                className={
                    open
                        ? "md:hidden"
                        : "hidden md:hidden"
                }
            >
                <div className="border-t border-neutral-800/70 bg-[#0B1726]/95 px-6 py-4">
                    <div className="flex flex-col gap-3 text-sm text-neutral-200">
                        <Link href="/collection" className="hover:text-white">
                            Collection
                        </Link>
                        <Link href="/products" className="hover:text-white">
                            Denim
                        </Link>
                        <Link href="/contact" className="hover:text-white">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
