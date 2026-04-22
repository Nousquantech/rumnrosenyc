import Link from "next/link";

import { Container } from "@/components/ui/Container";

export function Footer() {
    return (
        <footer className="border-t border-foreground/10">
            <Container className="py-10">
                <div className="grid gap-10 md:grid-cols-4">
                    <div className="space-y-3">
                        <div className="text-sm tracking-[0.25em]">RUMNROSE</div>
                        <p className="text-sm text-foreground/70">
                            Luxury-inspired demo storefront. No real transactions.
                        </p>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="text-xs tracking-[0.2em] text-foreground/60">Shop</div>
                        <div className="grid gap-2">
                            <Link className="hover:underline underline-offset-4" href="/women">
                                Women
                            </Link>
                            <Link className="hover:underline underline-offset-4" href="/men">
                                Men
                            </Link>
                            <Link className="hover:underline underline-offset-4" href="/collections">
                                Collections
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="text-xs tracking-[0.2em] text-foreground/60">Account</div>
                        <div className="grid gap-2">
                            <Link className="hover:underline underline-offset-4" href="/wishlist">
                                Wishlist
                            </Link>
                            <Link className="hover:underline underline-offset-4" href="/cart">
                                Cart
                            </Link>
                            <Link className="hover:underline underline-offset-4" href="/search">
                                Search
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="text-xs tracking-[0.2em] text-foreground/60">ABOUT</div>
                        <div className="grid gap-2">
                            <Link className="hover:underline underline-offset-4" href="/ourstory">
                                OUR STORY
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-xs text-foreground/60">
                    © {new Date().getFullYear()} RumnRose
                </div>
            </Container>
        </footer>
    );
}
