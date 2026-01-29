import Link from "next/link";

import PageProactiveTrigger from "../components/PageProactiveTrigger";
import { ProductCard } from "../components/ProductCard";
import { fetchProducts, PaginatedProducts } from "../lib/backend";

export default async function ProductsPage() {

    const data = await fetchProducts({ limit: 60 });
    const actualData = Array.isArray(data) ? data[0] : data;
    const products = actualData?.items || [];

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-10">
            <PageProactiveTrigger
                type="page_load"
                delayMs={900}
                hint="Want help choosing between slim and straight fits?"
            />

            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900">Denim</h1>
                    <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                        A small curated lineup — the AI is here to help you decide
                        quickly.
                    </p>
                </div>
                <Link
                    href="/"
                    className="text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                >
                    Back home
                </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                    <ProductCard
                        key={p.id}
                        product={{
                            id: p.id,
                            name: p.name,
                            price: Math.round(p.price),
                            fit: p.fit,
                            wash: p.style
                        }}
                    />
                ))}
            </div>
        </main>
    );
}
