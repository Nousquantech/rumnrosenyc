import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { getCollectionBySlug } from "@/lib/data";

type PageProps = {
    params: Promise<{ slug: string }>;
};

export default async function CollectionDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const collection = await getCollectionBySlug(slug);
    if (!collection) return notFound();

    return (
        <Container className="py-12">
            <header className="space-y-3">
                <div className="text-xs tracking-[0.2em] text-foreground/60">
                    {collection.season}
                </div>
                <h1 className="text-4xl tracking-tight">{collection.name}</h1>
                <p className="max-w-2xl text-sm text-foreground/70">
                    {collection.description}
                </p>
            </header>

            <section className="mt-10">
                <ProductGrid products={collection.products} />
            </section>
        </Container>
    );
}
