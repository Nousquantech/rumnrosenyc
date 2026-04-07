import Link from "next/link";

import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { getCollections, getProducts } from "@/lib/data";

export default async function HomePage() {
  const [featured, collections] = await Promise.all([
    getProducts({ tag: "featured" }),
    getCollections(),
  ]);

  return (
    <div className="flex flex-col">
      <section className="border-b border-foreground/10">
        <Container className="py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="text-xs tracking-[0.3em] text-foreground/60">
                SPRING EDIT
              </div>
              <h1 className="text-5xl tracking-tight md:text-6xl">
                Minimal forms. Elevated finish.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-foreground/70">
                A luxury-inspired storefront built to mirror the layout complexity and UX patterns
                of high-end fashion commerce — without brand assets.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/women/new-arrivals"
                  className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm text-background transition-colors hover:bg-foreground/90"
                >
                  Shop new arrivals
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex items-center justify-center rounded-full border border-foreground/15 px-5 py-3 text-sm transition-colors hover:border-foreground/25"
                >
                  Explore collections
                </Link>
              </div>
            </div>

            <div className="aspect-4/3 rounded-3xl border border-foreground/10 bg-foreground/3 p-10">
              <div className="h-full w-full rounded-2xl border border-foreground/10 bg-background/60" />
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <div className="flex items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="text-xs tracking-[0.3em] text-foreground/60">
                FEATURED
              </div>
              <h2 className="text-3xl tracking-tight md:text-4xl">Collections</h2>
            </div>
            <Link className="text-sm underline underline-offset-4" href="/collections">
              View all
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {collections.slice(0, 2).map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className="group rounded-3xl border border-foreground/10 p-10 transition-colors hover:border-foreground/20"
              >
                <div className="text-xs tracking-[0.2em] text-foreground/60">{c.season}</div>
                <div className="mt-3 text-2xl tracking-tight">{c.name}</div>
                <div className="mt-2 max-w-prose text-sm text-foreground/70">
                  {c.description}
                </div>
                <div className="mt-8 text-sm underline underline-offset-4 opacity-0 transition-opacity group-hover:opacity-100">
                  View collection
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-foreground/10">
        <Container className="py-16">
          <div className="space-y-3">
            <div className="text-xs tracking-[0.3em] text-foreground/60">HIGHLIGHTS</div>
            <h2 className="text-3xl tracking-tight md:text-4xl">Product Spotlight</h2>
          </div>
          <div className="mt-10">
            <ProductGrid products={featured} />
          </div>
        </Container>
      </section>
    </div>
  );
}
