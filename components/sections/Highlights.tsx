import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/data";

const Highlights = async () => {
    const featured = await getProducts({ tag: "featured" });
    const onSale = featured.filter((p) => p.sale);

    return (
        <section className="border-t border-foreground/10">
            <Container className="py-16">
                <div className="flex items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="text-xs tracking-[0.3em] text-foreground/50">
                            HIGHLIGHTS
                        </div>
                        <h2 className="text-3xl tracking-tight md:text-4xl">
                            Product Spotlight
                        </h2>
                    </div>
                    {onSale.length > 0 && (
                        <Link
                            href="/sale"
                            className="text-xs tracking-[0.1em] text-foreground/50 underline underline-offset-4 transition-opacity hover:opacity-60"
                        >
                            {onSale.length} SALE {onSale.length === 1 ? "PIECE" : "PIECES"} →
                        </Link>
                    )}
                </div>
                <div className="mt-10">
                    <ProductGrid products={featured} />
                </div>
            </Container>
        </section>
    );
};

export default Highlights;

// import Link from "next/link";
// import { Container } from "@/components/ui/Container";
// import { ProductGrid } from "@/components/product/ProductGrid";
// import { getCollections, getProducts } from "@/lib/data";

// const Highlights = async () => {
//     const [featured] = await Promise.all([
//         getProducts({ tag: "featured" }),
//         getCollections(),
//     ]);
//     return (

//         <section className="border-t border-foreground/10">
//             <Container className="py-16">
//                 <div className="space-y-3">
//                     <div className="text-xs tracking-[0.3em] text-foreground/60">HIGHLIGHTS</div>
//                     <h2 className="text-3xl tracking-tight md:text-4xl">Product Spotlight</h2>
//                 </div>
//                 <div className="mt-10">
//                     <ProductGrid products={featured} />
//                 </div>
//             </Container>
//         </section>
//     )
// }

// export default Highlights