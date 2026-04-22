import { Section } from "@/components/our-story/Section";

export function Woman() {
    return (
        <Section style={{ backgroundColor: "var(--rr-stone)" }}>
            <div className="grid gap-14 md:grid-cols-[3fr_4fr] md:items-center">

                {/* Left */}
                <div className="space-y-6">
                    <p className="section-label" style={{ color: "var(--rr-accent)" }}>
                        The RUM&amp;ROSE Person
                    </p>
                    <h2 className="font-cormorant font-light leading-[1.08] text-[clamp(30px,3.5vw,48px)]"
                        style={{ color: "var(--rr-ink)" }}>
                        They move freely
                        <br />
                        <em style={{ color: "var(--rr-denim)" }}>through the world.</em>
                    </h2>
                </div>

                {/* Right */}
                <div className="space-y-6">
                    <p className="text-base font-light leading-relaxed md:text-lg"
                        style={{ color: "var(--rr-ink)", opacity: 0.65 }}>
                        A traveler, a dreamer, someone who chooses their own path. Independent,
                        curious, and fully alive — life is full, and they intend to keep it that way.
                    </p>
                    <p className="text-base font-light leading-relaxed md:text-lg"
                        style={{ color: "var(--rr-ink)", opacity: 0.65 }}>
                        Their style reflects their spirit — effortless, versatile, comfortable
                        enough for a mountain trail or a cobblestone street without changing a thing.
                        Today we dress her. Soon, him too.
                    </p>
                    <blockquote
                        className="pl-6 border-l-2"
                        style={{ borderColor: "var(--rr-denim-light)" }}
                    >
                        <p
                            className="font-cormorant italic font-light text-xl leading-relaxed"
                            style={{ color: "var(--rr-denim)" }}
                        >
                            Every journey is an opportunity to live authentically.
                        </p>
                    </blockquote>
                </div>

            </div>
        </Section>
    );
}