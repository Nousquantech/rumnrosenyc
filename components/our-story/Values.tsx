import { Section } from "@/components/our-story/Section";

const values = [
    {
        num: "01",
        name: "Integrity",
        desc: "Being honest to yourself — and to the people who wear your work.",
    },
    {
        num: "02",
        name: "Respect",
        desc: "Every customer carries a story. We design with that story in mind.",
    },
    {
        num: "03",
        name: "Passion",
        desc: "A commitment to the craft — from the first sketch to the final stitch.",
    },
    {
        num: "04",
        name: "Quality",
        desc: "Timeless construction that holds up to a life fully lived.",
    },
];

export function Values() {
    return (
        <Section style={{ backgroundColor: "var(--rr-ink)", color: "var(--rr-cream)" }}>

            {/* Header */}
            <div className="text-center mb-16">
                <p
                    className="text-[11px] tracking-[0.3em] uppercase mb-5"
                    style={{ color: "var(--rr-accent)" }}
                >
                    What We Stand For
                </p>
                <h2
                    className="font-cormorant font-light leading-[1.12] text-[clamp(30px,3.8vw,50px)]"
                    style={{ color: "var(--rr-cream)" }}
                >
                    The principles that shape
                    <br />
                    <em style={{ color: "var(--rr-denim-light)" }}>
                        every garment we make
                    </em>
                </h2>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                {values.map((v) => (
                    <div
                        key={v.num}
                        className="p-10 transition-colors duration-300 hover:bg-white/[0.04]"
                        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                        <p
                            className="font-cormorant font-light leading-none mb-5 select-none"
                            style={{ fontSize: "52px", color: "rgba(255,255,255,0.09)" }}
                        >
                            {v.num}
                        </p>
                        <p
                            className="text-[11px] tracking-[0.24em] uppercase mb-3"
                            style={{ color: "var(--rr-accent)" }}
                        >
                            {v.name}
                        </p>
                        <p
                            className="text-sm font-light leading-relaxed"
                            style={{ color: "rgba(245,241,235,0.55)" }}
                        >
                            {v.desc}
                        </p>
                    </div>
                ))}
            </div>
        </Section>
    );
}