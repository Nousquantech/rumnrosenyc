import { Section } from "@/components/our-story/Section";

export function Craft() {
    return (
        <Section style={{ backgroundColor: "var(--rr-cream)" }}>
            <div className="mx-auto max-w-4xl text-center space-y-7">

                <p
                    className="text-[11px] tracking-[0.3em] uppercase"
                    style={{ color: "var(--rr-accent)" }}
                >
                    The Making
                </p>

                <h2
                    className="font-cormorant font-light leading-[1.15] text-[clamp(28px,3.5vw,48px)]"
                    style={{ color: "var(--rr-ink)" }}
                >
                    Each garment is created to be{" "}
                    <em style={{ color: "var(--rr-denim)" }}>lived in</em> —
                    <br />
                    comfortable, versatile, and adaptable.
                </h2>

                <p
                    className="text-base font-light leading-relaxed mx-auto max-w-2xl md:text-lg"
                    style={{ color: "var(--rr-ink)", opacity: 0.6 }}
                >
                    Every piece passes through hands that care — fabric tension, stitch
                    integrity, fit consistency. The standard is simple: if it doesn&apos;t
                    hold up to real life, it doesn&apos;t leave the studio.
                </p>

            </div>
        </Section>
    );
}