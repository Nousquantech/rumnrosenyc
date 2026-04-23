"use client";

import Link from "next/link";
import { getCollections, getProducts } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Product } from "@/lib/types";
import { useState, useEffect } from "react";

const Featured = () => {
    const [selectedFilter, setSelectedFilter] = useState("ALL");
    const [showAll, setShowAll] = useState(false);
    const [collections, setCollections] = useState(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [fetchedProducts, cols] = await Promise.all([
                getProducts({ tag: "featured" }),
                getCollections(),
            ]);
            setProducts(fetchedProducts);
            setCollections(cols);
            setLoading(false);
        };
        fetchData();
    }, []);


    const filters = ["ALL", "DRESSES", "SKIRTS", "PANTS", "VESTS"];

    const getProductType = (filter: string): string => {
        const typeMap: { [key: string]: string } = {
            "DRESSES": "DRESS",
            "SKIRTS": "SKIRT",
            "PANTS": "PANTS",
            "VESTS": "VEST"
        };
        return typeMap[filter] || filter;
    };

    const filteredProducts = selectedFilter === "ALL"
        ? products
        : products.filter(p => p.category?.toUpperCase() === getProductType(selectedFilter));

    const displayedProducts = showAll ? filteredProducts : filteredProducts.slice(0, 6);

    return (
        <div>
            {/* FILTERS */}
            <section className="px-8 py-6">
                <Container>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm tracking-widest">THE COLLECTION</h3>
                        {/* <button className="text-sm underline">View all 10 looks</button> */}
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {filters.map((item) => (
                            <button
                                key={item}
                                onClick={() => setSelectedFilter(item)}
                                className={`px-4 py-1.5 border rounded-full text-xs transition ${selectedFilter === item
                                    ? "bg-white text-black border-white"
                                    : "border-gray-400 hover:bg-white hover:text-black"
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </Container>
            </section>

            {/* GRID */}
            <section className="px-8 pb-8">
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedProducts.map((p) => (
                            <Link
                                key={p.id}
                                href={`/product/${p.slug}`}
                                className="group rounded-3xl border border-foreground/10 p-10 transition-colors hover:border-foreground/20"
                            >
                                <div className="bg-gray-800 h-64 flex items-center justify-center mb-4 rounded-2xl">
                                    <span className="text-gray-500">IMG</span>
                                </div>

                                <p className="text-xs text-gray-400 uppercase">{p.category}</p>
                                <h4 className="mb-2">{p.name}</h4>

                                <div className="flex items-center gap-2 text-sm">
                                    <span>${p.price}</span>
                                    {p.old && (
                                        <span className="line-through text-gray-500">${p.old}</span>
                                    )}
                                    {p.sale && (
                                        <span className="text-xs border px-2 py-0.5">Sale</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* PAGINATION */}
                    <div className="flex justify-center mt-12 pb-8">
                        <button
                            onClick={() => setShowAll(true)}
                            className="text-xs tracking-wider uppercase hover:opacity-70 transition"
                        >
                            SHOWING {displayedProducts.length} OF {filteredProducts.length} — LOAD ALL
                        </button>
                    </div>
                </Container>
            </section>
        </div>
    );
};

export default Featured;





// import Link from "next/link";
// import { Container } from "@/components/ui/Container";
// import { getCollections, getProducts } from "@/lib/data";

// const Featured = async () => {
//     const [collections] = await Promise.all([
//         getProducts({ tag: "featured" }),
//         getCollections(),
//     ]);

//     return (
//         <section>
//             <Container className="py-16">
//                 <div className="flex items-end justify-between gap-6">
//                     <div className="space-y-3">
//                         <div className="text-xs tracking-[0.3em] text-foreground/60">
//                             FEATURED
//                         </div>
//                         <h2 className="text-3xl tracking-tight md:text-4xl">Collections</h2>
//                     </div>
//                     <Link className="text-sm underline underline-offset-4" href="/collections">
//                         View all
//                     </Link>
//                 </div>

//                 <div className="mt-10 grid gap-6 md:grid-cols-2">
//                     {collections.slice(0, 2).map((c) => (
//                         <Link
//                             key={c.slug}
//                             href={`/collections/${c.slug}`}
//                             className="group rounded-3xl border border-foreground/10 p-10 transition-colors hover:border-foreground/20"
//                         >
//                             <div className="text-xs tracking-[0.2em] text-foreground/60">{c.season}</div>
//                             <div className="mt-3 text-2xl tracking-tight">{c.name}</div>
//                             <div className="mt-2 max-w-prose text-sm text-foreground/70">
//                                 {c.description}
//                             </div>
//                             <div className="mt-8 text-sm underline underline-offset-4 opacity-0 transition-opacity group-hover:opacity-100">
//                                 View collection
//                             </div>
//                         </Link>
//                     ))}
//                 </div>
//             </Container>
//         </section>
//     )
// }
// export default Featured