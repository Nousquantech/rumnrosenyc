import Image from "next/image";

import { Section } from "@/components/our-story/Section";

export function Hero() {
    return (
        <Section>
            <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background">
                <div className="absolute inset-0">
                    <Image
                        src="/hero.jpg"
                        alt="R&R"
                        fill
                        priority
                        sizes="(min-width: 768px) 80vw, 100vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-background/70" />
                </div>

                <div className="relative px-8 py-20 md:px-16 md:py-28">
                    <div className="max-w-xl space-y-6">
                        <h1 className="text-5xl font-light tracking-tight md:text-6xl">R&R</h1>
                        <div className="space-y-2 text-lg font-light leading-relaxed text-foreground/80 md:text-xl">
                            <p>A story of two creators.</p>
                            <p>Built in New York City.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}
