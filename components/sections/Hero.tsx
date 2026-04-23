import Link from "next/link";
import { Container } from "@/components/ui/Container";


const Hero = () => {
    return (
        <section
            className="px-8 py-16 border-t border-gray-200 bg-cover bg-right md:bg-center bg-no-repeat"
            style={{
                backgroundImage: "url('/BG_HERO_4.jpg')"
            }}
        >
            <Container className="py-16">
                <p className="text-xs tracking-widest mb-6 ps-20 text-gray-700">SPRING EDIT — 10 LOOKS</p>

                <div className="flex justify-between items-start ps-20">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif leading-tight mb-6 text-gray-800">
                            Minimal forms.<br />Elevated finish.
                        </h1>
                        <p className="text-gray-700 max-w-md mb-8">
                            A focused collection of women’s essentials. Each piece designed for quiet confidence.
                        </p>
                        <Link className="rounded-2xl p-5 bg-gray-800 text-white" href="/collections">
                            SHOP THE COLLECTION
                        </Link>
                    </div>

                </div>
            </Container>
        </section>

    );
};

export default Hero;

