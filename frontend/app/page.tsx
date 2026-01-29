import Link from "next/link";

import { fetchProducts } from "./lib/backend";

export default async function Home() {
    let products: Awaited<ReturnType<typeof fetchProducts>> = [];
    try {
        products = await fetchProducts({ limit: 3 });
    } catch {
        products = [];
    }

    return (
        <main className="bg-[#0B1726] text-neutral-100">
            {/* HERO */}
            <section className="flex min-h-screen items-center justify-center px-6">
                <div className="max-w-5xl text-center">
                    <h1 className="font-serif text-5xl tracking-tight md:text-7xl">
                        Rum&Rose
                    </h1>
                    <p className="mt-6 text-lg text-neutral-400 md:text-xl">
                        Premium denim. Crafted with restraint. Designed to endure.
                    </p>
                    <div className="mt-10">
                        <Link
                            href="/collection"
                            className="border border-neutral-600 px-8 py-3 text-sm uppercase tracking-wide transition hover:bg-neutral-100 hover:text-neutral-900"
                        >
                            View Collection
                        </Link>
                    </div>
                </div>
            </section>

            {/* BRAND PHILOSOPHY */}
            <section className="border-t border-neutral-800 px-6 py-24">
                <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2">
                    <div>
                        <h2 className="font-serif text-3xl md:text-4xl">
                            The House
                        </h2>
                        <p className="mt-6 leading-relaxed text-neutral-400">
                            Rum&Rose is a premium denim fashion house built on contrast
                            — strength and softness, structure and ease, heritage and
                            restraint. Every garment is designed to age with character.
                        </p>
                    </div>
                    <div className="aspect-[4/5] rounded-xl bg-neutral-800" />
                </div>
            </section>

            {/* COLLECTION PREVIEW */}
            <section className="border-t border-neutral-800 px-6 py-24">
                <div className="mx-auto max-w-6xl">
                    <h2 className="mb-12 font-serif text-3xl md:text-4xl">
                        Collection
                    </h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        {products.length ? (
                            products.map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/products/${p.id}`}
                                    className="group block"
                                >
                                    <div className="aspect-[3/4] rounded-xl bg-neutral-800 transition group-hover:bg-neutral-700" />
                                    <div className="mt-4 flex items-start justify-between gap-3">
                                        <p className="text-sm tracking-wide">{p.name}</p>
                                        <p className="text-sm text-neutral-300">${Math.round(p.price)}</p>
                                    </div>
                                    <p className="text-xs text-neutral-500">
                                        {[p.fit, p.style].filter(Boolean).join(" · ")}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <div className="text-sm text-neutral-400">
                                Collection preview will appear once the backend is running.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-neutral-800 px-6 py-16 text-sm text-neutral-500">
                <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 md:flex-row">
                    <p>© {new Date().getFullYear()} Rum&Rose</p>
                    <div className="flex gap-6">
                        <a className="hover:text-neutral-200" href="#">
                            Instagram
                        </a>
                        <Link className="hover:text-neutral-200" href="/contact">
                            Contact
                        </Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
