import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { getProducts } from "@/lib/data";
import type { Gender } from "@/lib/types";

type CategoryPageProps = {
    gender: Gender;
    category: string;
    title: string;
};

export async function CategoryPage({ gender, category, title }: CategoryPageProps) {
    const products = await getProducts({ gender, category });

    return (
        <Container className="py-12">
            <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                    <h1 className="text-4xl tracking-tight">{title}</h1>
                    <p className="max-w-2xl text-sm text-foreground/70">
                        Filtering UI placeholder — wire this to real facets later.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="rounded-full border border-foreground/15 px-4 py-2 text-xs text-foreground/70">
                        Sort: Featured
                    </div>
                    <div className="rounded-full border border-foreground/15 px-4 py-2 text-xs text-foreground/70">
                        Filter
                    </div>
                </div>
            </header>

            <section className="mt-10">
                <ProductGrid products={products} />
            </section>
        </Container>
    );
}
