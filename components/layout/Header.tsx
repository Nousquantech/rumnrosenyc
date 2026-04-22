// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { useEffect, useMemo, useState } from "react";

// import { MegaMenu } from "@/components/layout/MegaMenu";
// import { Container } from "@/components/ui/Container";

// export function Header() {
//     const pathname = usePathname();
//     const isHome = pathname === "/";

//     const [scrolled, setScrolled] = useState(false);

//     useEffect(() => {
//         const onScroll = () => setScrolled(window.scrollY > 16);
//         onScroll();
//         window.addEventListener("scroll", onScroll, { passive: true });
//         return () => window.removeEventListener("scroll", onScroll);
//     }, []);

//     const megaMenuGroups = useMemo(
//         () => [
//             {
//                 title: "Women",
//                 links: [
//                     { label: "New Arrivals", href: "/women/new-arrivals" },
//                     { label: "Bags", href: "/women/bags" },
//                     { label: "Shoes", href: "/women/shoes" },
//                     { label: "Accessories", href: "/women/accessories" },
//                 ],
//             },
//             {
//                 title: "Men",
//                 links: [
//                     { label: "Bags", href: "/men/bags" },
//                     { label: "Shoes", href: "/men/shoes" },
//                     { label: "Accessories", href: "/men/accessories" },
//                 ],
//             },
//             {
//                 title: "Home",
//                 links: [{ label: "Shop Home", href: "/home" }],
//             },
//         ],
//         []
//     );
//     const megaMenuGroupsWomen = useMemo(
//         () => [
//             {
//                 title: "Women",
//                 links: [
//                     { label: "New Arrivals", href: "/women/new-arrivals" },
//                     { label: "Bags", href: "/women/bags" },
//                     { label: "Shoes", href: "/women/shoes" },
//                     { label: "Accessories", href: "/women/accessories" },
//                 ],
//             },
//         ],
//         []
//     );

//     const solid = !isHome || scrolled;

//     return (
//         <header
//             className={
//                 "sticky top-0 z-50 transition-colors " +
//                 (solid
//                     ? "border-b border-foreground/10 bg-background/95 backdrop-blur"
//                     : "bg-transparent")
//             }
//         >
//             <Container className="h-16 flex items-center justify-between">
//                 <div className="flex items-center gap-10">
//                     <Link
//                         href="/"
//                         className="flex items-center text-foreground"
//                         aria-label="Home"
//                     >
//                         <Image
//                             src="/LongLogo.png"
//                             alt="RUMNROSE"
//                             width={160}
//                             height={24}

//                             priority
//                             className="h-6 w-auto"
//                         />
//                     </Link>

//                     <nav className="hidden items-center gap-8 text-sm md:flex">
//                         <div className="relative group">
//                             <button
//                                 type="button"
//                                 className="text-sm transition-colors hover:text-foreground/70"
//                                 aria-haspopup="true"
//                             >
//                                 Shop
//                             </button>
//                             <MegaMenu groups={megaMenuGroups} />
//                         </div>
//                         <div className="relative group">
//                             <button
//                                 type="button"
//                                 className="text-sm transition-colors hover:text-foreground/70"
//                                 aria-haspopup="true"
//                             >
//                                 Women
//                             </button>
//                             <MegaMenu groups={megaMenuGroupsWomen} />
//                         </div>

//                         {/* <Link className="transition-colors hover:text-foreground/70" href="/women">
//                             Women
//                             <MegaMenu groups={megaMenuGroupsWomen} />
//                         </Link> */}
//                         <Link className="transition-colors hover:text-foreground/70" href="/men">
//                             Men
//                         </Link>
//                         <Link className="transition-colors hover:text-foreground/70" href="/collections">
//                             Collections
//                         </Link>
//                     </nav>
//                 </div>

//                 <nav className="flex items-center gap-5 text-sm">
//                     <Link className="transition-colors hover:text-foreground/70" href="/search">
//                         Search
//                     </Link>
//                     <Link className="transition-colors hover:text-foreground/70" href="/wishlist">
//                         Wishlist
//                     </Link>
//                     <Link className="transition-colors hover:text-foreground/70" href="/cart">
//                         Cart
//                     </Link>
//                 </nav>
//             </Container>
//         </header>
//     );
// }

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { MegaMenu } from "./MegaMenu";
import { SideMenu } from "@/components/layout/SideMenu";
import { Container } from "@/components/ui/Container";

export function Header() {
    const pathname = usePathname();
    const isHome = pathname === "/";

    const [scrolled, setScrolled] = useState(false);
    const [openDesktopMenu, setOpenDesktopMenu] = useState<null | "women" | "men">(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (!openDesktopMenu) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpenDesktopMenu(null);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [openDesktopMenu]);

    const womenMenu = useMemo(
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
        ],
        []
    );

    const menMenu = useMemo(
        () => [
            {
                title: "Men",
                links: [
                    { label: "Bags", href: "/men/bags" },
                    { label: "Shoes", href: "/men/shoes" },
                    { label: "Accessories", href: "/men/accessories" },
                ],
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
                    ? "border-b border-foreground/10 bg-background/95"
                    : "bg-transparent")
            }
        >
            <Container className="relative h-16 flex items-center justify-between">

                {/* Left: hamburger */}
                <div className="flex items-center gap-6">
                    <div className="md:hidden">
                        <SideMenu />
                    </div>

                    <nav className="hidden items-center gap-8 text-sm md:flex">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setOpenDesktopMenu((current) =>
                                        current === "women" ? null : "women"
                                    )
                                }
                                className="text-sm font-light tracking-[0.08em] transition-opacity hover:opacity-60"
                                style={{ color: "var(--rr-ink)" }}
                                aria-haspopup="true"
                                aria-expanded={openDesktopMenu === "women"}
                            >
                                Women
                            </button>
                            <MegaMenu
                                groups={womenMenu}
                                open={openDesktopMenu === "women"}
                                onClose={() => setOpenDesktopMenu(null)}
                            />
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setOpenDesktopMenu((current) =>
                                        current === "men" ? null : "men"
                                    )
                                }
                                className="text-sm font-light tracking-[0.08em] transition-opacity hover:opacity-60"
                                style={{ color: "var(--rr-ink)" }}
                                aria-haspopup="true"
                                aria-expanded={openDesktopMenu === "men"}
                            >
                                Men
                            </button>
                            <MegaMenu
                                groups={menMenu}
                                open={openDesktopMenu === "men"}
                                onClose={() => setOpenDesktopMenu(null)}
                            />
                        </div>

                        <Link
                            className="text-sm font-light tracking-[0.08em] transition-opacity hover:opacity-60"
                            style={{ color: "var(--rr-ink)" }}
                            href="/collections"
                        >
                            Collections
                        </Link>

                        <Link
                            className="text-sm font-light tracking-[0.08em] transition-opacity hover:opacity-60"
                            style={{ color: "var(--rr-ink)" }}
                            href="/ourstory"
                        >
                            Our Story
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
                        className="transition-colors hover:opacity-60 hidden md:block"
                        style={{ color: "var(--rr-ink)" }}
                        href="/wishlist"
                    >
                        Wishlist
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