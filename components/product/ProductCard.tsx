import Link from "next/link";

import type { Product } from "@/lib/types";

type ProductCardProps = {
    product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
    const [primary, secondary] = product.images;

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group block"
            aria-label={product.name}
        >
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03]">
                {primary ? (
                    <img
                        src={primary}
                        alt={product.name}
                        className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                        loading="lazy"
                    />
                ) : null}
                {secondary ? (
                    <img
                        src={secondary}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        loading="lazy"
                    />
                ) : null}
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="truncate text-sm">{product.name}</div>
                    <div className="mt-1 text-xs tracking-[0.18em] text-foreground/60">
                        {labelFromCategory(product.category)}
                    </div>
                </div>
                <div className="text-sm tabular-nums">{formatPrice(product.price)}</div>
            </div>
        </Link>
    );
}

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function labelFromCategory(category: string) {
    return category
        .split("-")
        .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
        .join(" ");
}
