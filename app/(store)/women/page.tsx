import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { getProducts } from "@/lib/data";

export default async function WomenLandingPage() {
    const products = await getProducts({ gender: "women" });

    return (
        <Container className="py-12">
            <header className="space-y-3">
                <h1 className="text-4xl tracking-tight">Women</h1>
                <p className="max-w-2xl text-sm text-foreground/70">
                    A curated edit of modern essentials with a quiet luxury point of view.
                </p>
            </header>

            <section className="mt-10">
                <ProductGrid products={products.slice(0, 12)} />
            </section>
        </Container>
    );
}
