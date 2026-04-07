import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { getProducts } from "@/lib/data";

export default async function WomenNewArrivalsPage() {
    const products = await getProducts({ gender: "women", tag: "new" });

    return (
        <Container className="py-12">
            <header className="space-y-3">
                <h1 className="text-4xl tracking-tight">New Arrivals</h1>
                <p className="max-w-2xl text-sm text-foreground/70">
                    Seasonal highlights, refreshed weekly.
                </p>
            </header>

            <section className="mt-10">
                <ProductGrid products={products} />
            </section>
        </Container>
    );
}
