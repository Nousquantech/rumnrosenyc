"use client";

import Link from "next/link";
import { Section } from "@/components/our-story/Section";
import { useState } from "react";

export function Final() {
    const [hovered, setHovered] = useState(false);

    return (
        <Section style={{ backgroundColor: "var(--rr-ink)" }}>
            <div className="flex flex-col items-center justify-between gap-10 md:flex-row">

                {/* Left: headline */}
                <h2
                    className="font-cormorant font-light leading-[1.15] text-[clamp(28px,3vw,46px)] text-center md:text-left"
                    style={{ color: "var(--rr-cream)" }}
                >
                    Ready to find your
                    <br />
                    <em style={{ color: "var(--rr-denim-light)" }}>next chapter?</em>
                </h2>

                {/* Right: CTA button */}
                <Link
                    href="/collections"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    className="flex-shrink-0 inline-block px-12 py-5 text-[11px] tracking-[0.24em] uppercase transition-colors duration-200"
                    style={{
                        backgroundColor: hovered ? "var(--rr-denim)" : "var(--rr-cream)",
                        color: hovered ? "var(--rr-cream)" : "var(--rr-ink)",
                    }}
                >
                    Explore the Collection
                </Link>

            </div>
        </Section>
    );
}