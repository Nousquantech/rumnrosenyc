import Link from "next/link";

import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

type ProductInfoProps = {
    product: Product;
};

export function ProductInfo({ product }: ProductInfoProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <div className="text-xs tracking-[0.2em] text-foreground/60">
                    {product.gender.toUpperCase()} · {labelFromCategory(product.category)}
                </div>
                <h1 className="text-4xl tracking-tight">{product.name}</h1>
                <div className="text-lg tabular-nums">{formatPrice(product.price)}</div>
            </div>

            <p className="max-w-prose text-sm leading-7 text-foreground/70">
                {product.description}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button">Add to cart</Button>
                <Button type="button" variant="ghost">
                    Add to wishlist
                </Button>
            </div>

            <div className="rounded-2xl border border-foreground/10 p-6 text-sm">
                <div className="text-xs tracking-[0.2em] text-foreground/60">Details</div>
                <div className="mt-4 grid gap-2 text-foreground/70">
                    <div>Premium materials with a refined finish</div>
                    <div>Designed for a minimalist wardrobe</div>
                    <div>Shipping + returns placeholder</div>
                </div>
                <div className="mt-6">
                    <Link className="text-sm underline underline-offset-4" href="/cart">
                        View cart
                    </Link>
                </div>
            </div>
        </div>
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
