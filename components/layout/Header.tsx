"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { MegaMenu } from "@/components/layout/MegaMenu";
import { Container } from "@/components/ui/Container";

export function Header() {
    const pathname = usePathname();
    const isHome = pathname === "/";

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const megaMenuGroups = useMemo(
        () => [
            {
                title: "Women",
                links: [
                    { label: "New Arrivals", href: "/women/new-arrivals" },
                    { label: "Bags", href: "/women/bags" },
                    { label: "Shoes", href: "/women/shoes" },
                    { label: "Accessories", href: "/women/accessories" },
                ],
            },
            {
                title: "Men",
                links: [
                    { label: "Bags", href: "/men/bags" },
                    { label: "Shoes", href: "/men/shoes" },
                    { label: "Accessories", href: "/men/accessories" },
                ],
            },
            {
                title: "Kids",
                links: [{ label: "Shop Kids", href: "/kids" }],
            },
        ],
        []
    );

    const solid = !isHome || scrolled;

    return (
        <header
            className={
                "sticky top-0 z-50 transition-colors " +
                (solid
                    ? "border-b border-foreground/10 bg-background/95 backdrop-blur"
                    : "bg-transparent")
            }
        >
            <Container className="h-16 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <Link
                        href="/"
                        className="text-xs tracking-[0.35em] text-foreground"
                        aria-label="Home"
                    >
                        RUMNROSE
                    </Link>

                    <nav className="hidden items-center gap-8 text-sm md:flex">
                        <div className="relative group">
                            <button
                                type="button"
                                className="text-sm transition-colors hover:text-foreground/70"
                                aria-haspopup="true"
                            >
                                Shop
                            </button>
                            <MegaMenu groups={megaMenuGroups} />
                        </div>

                        <Link className="transition-colors hover:text-foreground/70" href="/women">
                            Women
                        </Link>
                        <Link className="transition-colors hover:text-foreground/70" href="/men">
                            Men
                        </Link>
                        <Link className="transition-colors hover:text-foreground/70" href="/collections">
                            Collections
                        </Link>
                    </nav>
                </div>

                <nav className="flex items-center gap-5 text-sm">
                    <Link className="transition-colors hover:text-foreground/70" href="/search">
                        Search
                    </Link>
                    <Link className="transition-colors hover:text-foreground/70" href="/wishlist">
                        Wishlist
                    </Link>
                    <Link className="transition-colors hover:text-foreground/70" href="/cart">
                        Cart
                    </Link>
                </nav>
            </Container>
        </header>
    );
}
