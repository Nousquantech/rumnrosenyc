"use client";

import Link from "next/link";
import { useState } from "react";

type SubGroup = {
    label: string;
    href?: string;
    links: { label: string; href: string }[];
};

type TopItem = {
    label: string;
    href?: string;
    groups?: SubGroup[];
    links?: { label: string; href: string }[];
};

const NAV_ITEMS: TopItem[] = [
    {
        label: "Women",
        groups: [
            {
                label: "Ready to Wear",
                links: [
                    { label: "New Arrivals", href: "/women/new-arrivals" },
                    { label: "Dresses", href: "/women/dresses" },
                    { label: "Tops & Shirts", href: "/women/tops" },
                    { label: "Pants & Shorts", href: "/women/pants" },
                    { label: "Denim", href: "/women/denim" },
                    { label: "Outerwear", href: "/women/outerwear" },
                ],
            },
            {
                label: "Accessories",
                links: [
                    { label: "Bags", href: "/women/bags" },
                    { label: "Shoes", href: "/women/shoes" },
                    { label: "Belts", href: "/women/belts" },
                ],
            },
        ],
    },
    {
        label: "Men",
        groups: [
            {
                label: "Ready to Wear",
                links: [
                    { label: "New Arrivals", href: "/men/new-arrivals" },
                    { label: "Shirts", href: "/men/shirts" },
                    { label: "Pants", href: "/men/pants" },
                    { label: "Denim", href: "/men/denim" },
                    { label: "Outerwear", href: "/men/outerwear" },
                ],
            },
            {
                label: "Accessories",
                links: [
                    { label: "Bags", href: "/men/bags" },
                    { label: "Shoes", href: "/men/shoes" },
                ],
            },
        ],
    },
    {
        label: "Collections",
        links: [
            { label: "Spring 2025", href: "/collections/spring-2025" },
            { label: "Summer 2025", href: "/collections/summer-2025" },
            { label: "View All", href: "/collections" },
        ],
    },
    {
        label: "Our Story",
        href: "/ourstory",
    },
];

export function SideMenu() {
    const [open, setOpen] = useState(false);
    const [activeTop, setActiveTop] = useState<string | null>(null);

    const close = () => {
        setOpen(false);
        setActiveTop(null);
    };

    const activeItem = NAV_ITEMS.find((i) => i.label === activeTop);

    return (
        <>
            {/* Hamburger / Close button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex flex-col justify-center gap-1.25 w-8 h-8 focus:outline-none"
                aria-label={open ? "Close menu" : "Open menu"}
            >
                <span
                    className="block h-px w-6 transition-all duration-300 origin-center"
                    style={{
                        backgroundColor: "var(--rr-ink)",
                        transform: open ? "translateY(5px) rotate(45deg)" : "none",
                    }}
                />
                <span
                    className="block h-px w-6 transition-all duration-300"
                    style={{
                        backgroundColor: "var(--rr-ink)",
                        opacity: open ? 0 : 1,
                    }}
                />
                <span
                    className="block h-px w-6 transition-all duration-300 origin-center"
                    style={{
                        backgroundColor: "var(--rr-ink)",
                        transform: open ? "translateY(-5px) rotate(-45deg)" : "none",
                    }}
                />
            </button>

            {/* Backdrop */}
            <div
                onClick={close}
                className="fixed inset-0 z-40 transition-opacity duration-300"
                style={{
                    backgroundColor: "rgba(28,26,23,0.35)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                }}
            />

            {/* Sidebar panel — col 1: top-level items */}
            <div
                className="fixed top-0 left-0 z-50 h-full flex"
                style={{
                    transform: open ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                }}
            >
                {/* Primary column */}
                <div
                    className="h-full flex flex-col overflow-y-auto"
                    style={{
                        width: "260px",
                        backgroundColor: "var(--rr-cream)",
                        borderRight: "1px solid rgba(28,26,23,0.08)",
                    }}
                >
                    {/* Top bar */}
                    <div
                        className="h-16 flex items-center px-8 shrink-0"
                        style={{ borderBottom: "1px solid rgba(28,26,23,0.08)" }}
                    >
                        <Link
                            href="/"
                            onClick={close}
                            className="font-cormorant text-xl font-light tracking-[0.12em]"
                            style={{ color: "var(--rr-ink)" }}
                        >
                            RUMNROSE
                        </Link>
                    </div>

                    {/* Nav items */}
                    <nav className="flex-1 py-8">
                        {NAV_ITEMS.map((item) => {
                            const hasChildren = !!(item.groups || item.links);
                            const isActive = activeTop === item.label;

                            return (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        if (!hasChildren && item.href) {
                                            close();
                                        } else {
                                            setActiveTop(isActive ? null : item.label);
                                        }
                                    }}
                                    className="w-full flex items-center justify-between px-8 py-3 text-left transition-colors duration-150 group"
                                    style={{
                                        color: isActive ? "var(--rr-denim)" : "var(--rr-ink)",
                                    }}
                                >
                                    {item.href && !hasChildren ? (
                                        <Link
                                            href={item.href}
                                            onClick={close}
                                            className="text-sm tracking-[0.08em] font-light w-full"
                                        >
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span className="text-sm tracking-[0.08em] font-light">
                                            {item.label}
                                        </span>
                                    )}
                                    {hasChildren && (
                                        <span
                                            className="text-xs transition-transform duration-200"
                                            style={{
                                                transform: isActive ? "rotate(90deg)" : "none",
                                                color: "var(--rr-warm)",
                                            }}
                                        >
                                            →
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Bottom links */}
                    <div
                        className="py-6 px-8 space-y-3"
                        style={{ borderTop: "1px solid rgba(28,26,23,0.08)" }}
                    >
                        <Link
                            href="/search"
                            onClick={close}
                            className="block text-xs tracking-[0.18em] uppercase opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color: "var(--rr-ink)" }}
                        >
                            Search
                        </Link>
                        <Link
                            href="/wishlist"
                            onClick={close}
                            className="block text-xs tracking-[0.18em] uppercase opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color: "var(--rr-ink)" }}
                        >
                            Wishlist
                        </Link>
                        <Link
                            href="/cart"
                            onClick={close}
                            className="block text-xs tracking-[0.18em] uppercase opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color: "var(--rr-ink)" }}
                        >
                            Cart
                        </Link>
                    </div>
                </div>

                {/* Secondary column — slides in when a top item is active */}
                <div
                    className="h-full overflow-y-auto shrink-0"
                    style={{
                        width: activeItem ? "260px" : "0px",
                        backgroundColor: "var(--rr-stone)",
                        transition: "width 0.35s cubic-bezier(0.16,1,0.3,1)",
                        overflow: "hidden",
                        borderRight: "1px solid rgba(28,26,23,0.06)",
                    }}
                >
                    <div style={{ width: "260px" }}>
                        {/* Header */}
                        <div
                            className="h-16 flex items-center px-8 shrink-0"
                            style={{ borderBottom: "1px solid rgba(28,26,23,0.08)" }}
                        >
                            <span
                                className="font-cormorant text-lg font-light tracking-[0.08em]"
                                style={{ color: "var(--rr-ink)" }}
                            >
                                {activeItem?.label}
                            </span>
                        </div>

                        <div className="py-8">
                            {/* Groups with sub-labels */}
                            {activeItem?.groups?.map((group) => (
                                <div key={group.label} className="mb-8 px-8">
                                    <p
                                        className="text-[10px] tracking-[0.28em] uppercase mb-3"
                                        style={{ color: "var(--rr-accent)" }}
                                    >
                                        {group.label}
                                    </p>
                                    <div className="space-y-1">
                                        {group.links.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={close}
                                                className="block py-1.5 text-sm font-light tracking-[0.04em] transition-colors duration-150 hover:opacity-60"
                                                style={{ color: "var(--rr-ink)" }}
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Flat links (no groups) */}
                            {activeItem?.links && (
                                <div className="px-8 space-y-1">
                                    {activeItem.links.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={close}
                                            className="block py-1.5 text-sm font-light tracking-[0.04em] transition-colors duration-150 hover:opacity-60"
                                            style={{ color: "var(--rr-ink)" }}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}