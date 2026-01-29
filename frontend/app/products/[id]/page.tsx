import Link from "next/link";
import { notFound } from "next/navigation";

import ProductDetailClient from "./ProductDetailClient";
import { fetchProductById } from "../../lib/backend";

export default async function ProductDetailPage({
    params
}: {
    params: { id: string };
}) {
    const product = await fetchProductById(params.id);
    if (!product) return notFound();

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-10">
            <Link
                href="/products"
                className="text-sm font-semibold text-neutral-700 hover:text-neutral-900"
            >
                ← Back to products
            </Link>

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900">
                            {product.name}
                        </h1>
                        <div className="mt-1 text-sm text-neutral-600">
                            {product.fit} · {product.style}
                        </div>
                    </div>
                    <div className="text-xl font-semibold text-neutral-900">
                        ${Math.round(product.price)}
                    </div>
                </div>

                <p className="mt-4 text-sm text-neutral-700">{product.description}</p>

                <div className="mt-6 rounded-xl bg-neutral-50 p-4">
                    <div className="text-sm font-semibold text-neutral-900">
                        Not sure?
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">
                        Ask the assistant for sizing and fit advice — or get
                        alternatives.
                    </p>
                    <div className="mt-4">
                        <ProductDetailClient productId={product.id} />
                    </div>
                </div>
            </div>
        </main>
    );
}
