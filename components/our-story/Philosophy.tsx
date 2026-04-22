import { Section } from "@/components/our-story/Section";

export function Philosophy() {
    return (
        <Section style={{ backgroundColor: "var(--rr-cream)" }}>
            <div className="grid gap-14 md:grid-cols-2 md:items-end">

                {/* Left: big serif headline */}
                <div className="space-y-3">
                    <p
                        className="text-[11px] tracking-[0.3em] uppercase mb-6"
                        style={{ color: "var(--rr-accent)" }}
                    >
                        Our Purpose
                    </p>
                    <h2
                        className="font-cormorant font-light leading-[1.08] text-[clamp(32px,3.8vw,52px)]"
                        style={{ color: "var(--rr-ink)" }}
                    >
                        Behind every person
                        <br />
                        is a story.
                        <br />
                        <em style={{ color: "var(--rr-denim)" }}>
                            Behind every story — RUM&amp;ROSE.
                        </em>
                    </h2>
                </div>

                {/* Right: body + pull quote */}
                <div className="space-y-7 md:pb-2">
                    <p className="text-base font-light leading-relaxed md:text-lg"
                        style={{ color: "var(--rr-ink)", opacity: 0.65 }}>
                        We exist to create clothing that reflects identity, emotion, and
                        quiet confidence — garments for people who move through the world
                        on their own terms.
                    </p>
                    <blockquote
                        className="pl-6 border-l-2"
                        style={{ borderColor: "var(--rr-denim-light)" }}
                    >
                        <p
                            className="font-cormorant italic font-light leading-relaxed text-xl"
                            style={{ color: "var(--rr-denim)" }}
                        >
                            To empower self-expression through timeless, versatile apparel
                            that reflects the true essence of our customers.
                        </p>
                    </blockquote>
                </div>
            </div>
        </Section>
    );
}