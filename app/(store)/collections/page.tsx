import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { getCollections } from "@/lib/data";

export default async function CollectionsPage() {
    const collections = await getCollections();

    return (
        <Container className="py-12">
            <header className="space-y-3">
                <h1 className="text-4xl tracking-tight">Collections</h1>
                <p className="max-w-2xl text-sm text-foreground/70">
                    Limited drops and editorial stories.
                </p>
            </header>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
                {collections.map((collection) => (
                    <Link
                        key={collection.slug}
                        href={`/collections/${collection.slug}`}
                        className="group rounded-2xl border border-foreground/10 p-8 transition-colors hover:border-foreground/20"
                    >
                        <div className="text-xs tracking-[0.2em] text-foreground/60">
                            {collection.season}
                        </div>
                        <div className="mt-3 text-2xl tracking-tight">{collection.name}</div>
                        <div className="mt-2 text-sm text-foreground/70">
                            {collection.description}
                        </div>
                        <div className="mt-6 text-sm underline underline-offset-4 opacity-0 transition-opacity group-hover:opacity-100">
                            View collection
                        </div>
                    </Link>
                ))}
            </div>
        </Container>
    );
}
