import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { getProducts } from "@/lib/data";

export default async function HomePage() {
    const products = await getProducts({ gender: "kids" });

    return (
        <Container className="py-12">
            <header className="space-y-3">
                <h1 className="text-4xl tracking-tight">Home</h1>
                <p className="max-w-2xl text-sm text-foreground/70">
                    Mini essentials with refined finishing touches.
                </p>
            </header>

            <section className="mt-10">
                <ProductGrid products={products} />
            </section>
        </Container>
    );
}
