import { Section } from "@/components/our-story/Section";

export function Aesthetic() {
    return (
        <Section style={{ backgroundColor: "var(--rr-cream)" }}>
            <div className="grid gap-14 md:grid-cols-2 md:items-end">

                <h2
                    className="font-cormorant font-light leading-[1.08] text-[clamp(30px,3.5vw,48px)]"
                    style={{ color: "var(--rr-ink)" }}
                >
                    Our aesthetic lives between
                    <br />
                    <em style={{ color: "var(--rr-denim)" }}>softness and structure.</em>
                </h2>

                <div className="space-y-5 md:pb-2">
                    <p
                        className="text-base font-light leading-relaxed md:text-lg"
                        style={{ color: "var(--rr-ink)", opacity: 0.65 }}
                    >
                        Inspired by romance and modern freedom, each piece is designed to
                        move effortlessly — from cobblestone streets to open coastlines.
                    </p>
                    <p
                        className="text-base font-light leading-relaxed md:text-lg"
                        style={{ color: "var(--rr-ink)", opacity: 0.65 }}
                    >
                        Customizable, authentic, comfortable, versatile. These aren&apos;t just
                        words — they&apos;re the brief behind every silhouette we create.
                    </p>
                </div>

            </div>
        </Section>
    );
}