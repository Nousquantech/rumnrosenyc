"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SideMenu } from "@/components/layout/SideMenu";
import { Container } from "@/components/ui/Container";

export function Header() {
    const pathname = usePathname();
    const isHome = pathname === "/";

    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);


    // useEffect(() => {
    //     const onScroll = () => setScrolled(window.scrollY > 16);
    //     onScroll();
    //     window.addEventListener("scroll", onScroll, { passive: true });
    //     return () => window.removeEventListener("scroll", onScroll);
    // }, []);

    useEffect(() => {
        const onScroll = () => {
            const currentScrollY = window.scrollY;

            // always show at top
            if (currentScrollY < 10) {
                setVisible(true);
                setLastScrollY(currentScrollY);
                return;
            }

            // scrolling down → hide
            if (currentScrollY > lastScrollY) {
                setVisible(false);
            }
            // scrolling up → show
            else {
                setVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [lastScrollY]);


    const solid = !isHome || scrolled;

    return (
        <header
            // className={
            //     "sticky top-0 z-50 transition-colors border-b border-gray-200" +
            //     (solid
            //         ? "border-b border-gray-200 bg-white/75"
            //         : "bg-white/50")
            // }
            className={
                "sticky top-0 z-50 border-b border-gray-200 transition-transform duration-300 " +
                (visible ? "translate-y-0" : "-translate-y-full") +
                (solid ? " bg-white" : " bg-white")
            }
        >
            <Container className="relative h-16 flex items-center justify-between">

                {/* Left: hamburger */}
                <div className="flex items-center gap-6">
                    <div className="md:hidden">
                        <SideMenu />
                    </div>

                    <nav className="hidden items-center gap-8 text-sm md:flex">
                        <Link
                            className="text-sm font-light tracking-[0.08em] transition-opacity hover:opacity-60"
                            style={{ color: "var(--rr-ink)" }}
                            href="/women/dresses"
                        >
                            DRESSES
                        </Link>
                        <Link
                            className="text-sm font-light tracking-[0.08em] transition-opacity hover:opacity-60"
                            style={{ color: "var(--rr-ink)" }}
                            href="/women/skirts"
                        >
                            SKIRTS
                        </Link>

                        <Link
                            className="text-sm font-light tracking-[0.08em] transition-opacity hover:opacity-60"
                            style={{ color: "var(--rr-ink)" }}
                            href="/women/pants"
                        >
                            PANTS
                        </Link>

                        <Link
                            className="text-sm font-light tracking-[0.08em] transition-opacity hover:opacity-60"
                            style={{ color: "var(--rr-ink)" }}
                            href="/women/vests"
                        >
                            VESTS
                        </Link>
                    </nav>
                </div>

                {/* Center: logo */}
                <Link
                    href="/"
                    className="absolute left-1/2 -translate-x-1/2 flex items-center"
                    aria-label="Home"
                >
                    <Image
                        src="/LongLogo.png"
                        alt="RUMNROSE"
                        width={160}
                        height={24}
                        priority
                        className="h-6 w-auto"
                    />
                </Link>

                {/* Right: utility links */}
                <nav className="flex items-center gap-5 text-sm">
                    <Link
                        className="transition-colors hover:opacity-60 hidden md:block"
                        style={{ color: "var(--rr-ink)" }}
                        href="/search"
                    >
                        Search
                    </Link>
                    <Link
                        className="transition-colors hover:opacity-60"
                        style={{ color: "var(--rr-ink)" }}
                        href="/cart"
                    >
                        Cart
                    </Link>
                </nav>

            </Container>
        </header>
    );
}