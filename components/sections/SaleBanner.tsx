import Link from "next/link";
import { Container } from "@/components/ui/Container";

const SaleBanner = () => {
    return (

        <section className="px-8 py-8 ">
            <Container className="py-8">
                <div className="border border-gray-500 rounded-xl p-6 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-700">SPRING SALE</p>
                        <h2 className="text-2xl font-bold text-gray-800">UP TO 30% OFF</h2>
                    </div>
                    <Link
                        href="/sale"
                        className="text-xs tracking-[0.12em] underline underline-offset-4 transition-opacity hover:opacity-60"
                    >
                        SHOP SALE
                    </Link>
                </div>

            </Container>
        </section>

    );
};

export default SaleBanner;