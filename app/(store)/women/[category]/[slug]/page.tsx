import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { Container } from "@/components/ui/Container";
import { getProductBySlug } from "@/lib/data";

type PageProps = {
    params: Promise<{ category: string; slug: string }>;
};

export default async function WomenProductByCategoryPage({ params }: PageProps) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product || product.gender !== "women") return notFound();

    return (
        <Container className="py-10">
            <div className="grid gap-10 lg:grid-cols-2">
                <ProductGallery images={product.images} name={product.name} />
                <ProductInfo product={product} />
            </div>
        </Container>
    );
}
