import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { getProducts } from "@/lib/data";

export default async function MenLandingPage() {
    const products = await getProducts({ gender: "men" });

    return (
        <Container className="py-12">
            <header className="space-y-3">
                <h1 className="text-4xl tracking-tight">Men</h1>
                <p className="max-w-2xl text-sm text-foreground/70">
                    Tailored silhouettes, elevated materials, and understated details.
                </p>
            </header>

            <section className="mt-10">
                <ProductGrid products={products.slice(0, 12)} />
            </section>
        </Container>
    );
}
