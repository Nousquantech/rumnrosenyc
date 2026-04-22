"use client";
import Image from "next/image";

export function Founders() {
    return (
        <section
            className="min-h-[92vh] grid md:grid-cols-[5fr_6fr]"
            style={{ backgroundColor: "var(--rr-cream)" }}
        >
            {/* ── Left: photo ── */}
            <div className="relative overflow-hidden min-h-[55vw] md:min-h-0">
                <Image
                    src="/founders.jpg"
                    alt="R&R Founders in their New York atelier"
                    fill
                    sizes="(min-width: 768px) 42vw, 100vw"
                    className="object-cover object-top"
                    style={{ transform: "scale(1.03)", transition: "transform 8s ease-out" }}
                    priority
                    onLoad={(e) => {
                        (e.currentTarget as HTMLImageElement).style.transform = "scale(1)";
                    }}
                />
                {/* fade into right column on desktop */}
                <div
                    className="absolute inset-0 hidden md:block"
                    style={{
                        background:
                            "linear-gradient(to right, transparent 65%, var(--rr-cream))",
                    }}
                />
                {/* fade up on mobile */}
                <div
                    className="absolute inset-0 block md:hidden"
                    style={{
                        background:
                            "linear-gradient(to top, var(--rr-cream) 8%, transparent)",
                    }}
                />
            </div>

            {/* ── Right: copy ── */}
            <div className="flex flex-col justify-center gap-8 px-8 py-16 md:pl-14 md:pr-20 md:py-0">
                {/* eyebrow */}
                <p
                    className="text-[11px] tracking-[0.32em] uppercase animate-[fadeUp_0.7s_0.2s_both]"
                    style={{ color: "var(--rr-accent)" }}
                >
                    Founded 2024 · New York
                </p>

                {/* headline */}
                <h1
                    className="font-cormorant font-light leading-[1.05] text-[clamp(46px,5.2vw,76px)] animate-[fadeUp_0.7s_0.4s_both]"
                    style={{ color: "var(--rr-ink)" }}
                >
                    Behind every
                    <br />
                    person is
                    <br />
                    <em style={{ color: "var(--rr-denim)" }}>a story.</em>
                </h1>

                {/* body */}
                <div
                    className="space-y-4 max-w-md animate-[fadeUp_0.7s_0.6s_both]"
                    style={{ color: "var(--rr-ink)" }}
                >
                    <p className="text-base font-light leading-relaxed opacity-70 md:text-lg">
                        RUM&amp;ROSE is a New York apparel label built on two convictions: that{" "}
                        <strong className="font-medium" style={{ color: "var(--rr-denim)", opacity: 1 }}>
                            great craft
                        </strong>{" "}
                        deserves to be worn every day, and that every person carries a story worth dressing for.
                    </p>
                    <p className="text-base font-light leading-relaxed opacity-70 md:text-lg">
                        While one shapes the creative direction, the other brings each piece
                        to life — together, we create garments designed to be felt, not just worn.
                    </p>
                </div>

                {/* caption */}
                <p
                    className="text-[11px] tracking-[0.2em] uppercase animate-[fadeUp_0.7s_0.8s_both]"
                    style={{ color: "var(--rr-warm)" }}
                >
                    Creative &amp; Production · New York City
                </p>
            </div>

            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </section>
    );
}