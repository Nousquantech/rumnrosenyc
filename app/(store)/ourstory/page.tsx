import { Aesthetic } from "@/components/our-story/Aesthetic";
import { Craft } from "@/components/our-story/Craft";
import { Final } from "@/components/our-story/Final";
import { Founders } from "@/components/our-story/Founders";
import { Philosophy } from "@/components/our-story/Philosophy";
import { Reveal } from "@/components/our-story/Reveal";
import { Values } from "@/components/our-story/Values";
import { Woman } from "@/components/our-story/Woman";

export const metadata = {
    title: "Our Story",
    description: "Behind every person is a story. Behind every story — R&R.",
};

export default function OurStoryPage() {
    return (
        <div style={{ backgroundColor: "var(--rr-cream)", color: "var(--rr-ink)" }}>
            {/* Hero — no Reveal, animate on load via CSS */}
            <Founders />

            <Reveal>
                <Philosophy />
            </Reveal>

            <Reveal>
                <Values />
            </Reveal>

            <Reveal>
                <Aesthetic />
            </Reveal>

            <Reveal>
                <Woman />
            </Reveal>

            <Reveal>
                <Craft />
            </Reveal>

            <Reveal>
                <Final />
            </Reveal>
        </div>
    );
}