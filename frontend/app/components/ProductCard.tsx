import Link from "next/link";

export type ProductLike = {
    id: string;
    name: string;
    price: number;
    fit?: string;
    wash?: string;
};

export function ProductCard({
    product,
    variant = "default"
}: {
    product: ProductLike;
    variant?: "default" | "chat";
}) {
    const cardClassName =
        variant === "chat"
            ? "block rounded-xl border-2 border-dashed border-[#D9AC84] bg-[#F2E8DF] p-3 shadow-sm transition hover:shadow-md"
            : "block rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:shadow-md";

    const titleClassName =
        variant === "chat"
            ? "truncate text-sm font-semibold text-[#162840]"
            : "truncate text-sm font-semibold text-neutral-900";

    const metaClassName =
        variant === "chat" ? "mt-1 text-xs text-[#162840]/80" : "mt-1 text-xs text-neutral-600";

    const priceClassName =
        variant === "chat"
            ? "shrink-0 text-sm font-semibold text-[#162840]"
            : "shrink-0 text-sm font-semibold text-neutral-900";

    const linkHintClassName =
        variant === "chat" ? "mt-2 text-xs text-[#162840]/80" : "mt-2 text-xs text-neutral-600";

    return (
        <Link
            href={`/products/${product.id}`}
            className={cardClassName}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className={titleClassName}>
                        {product.name}
                    </div>
                    {product.fit || product.wash ? (
                        <div className={metaClassName}>
                            {[product.fit, product.wash].filter(Boolean).join(" · ")}
                        </div>
                    ) : null}
                </div>
                <div className={priceClassName}>
                    ${product.price}
                </div>
            </div>
            <div className={linkHintClassName}>View details →</div>
        </Link>
    );
}
