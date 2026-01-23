"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import ChatWidget from "@/app/components/ChatWidget";

interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    description?: string;
}

export default function CollectionPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Fetch collection products
        axios.get("http://localhost:8000/products")
            .then(res => setProducts(res.data))
            .catch(err => console.error("Error fetching products:", err));
    }, []);

    return (
        <main className="bg-[#0B1726] text-neutral-100 min-h-screen px-6 py-12">
            {/* HERO */}
            <section className="max-w-6xl mx-auto text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-serif">Rum&Rose Collection</h1>
                <p className="mt-4 text-neutral-400 text-lg md:text-xl">Premium denim crafted with care and precision.</p>
            </section>

            {/* PRODUCTS GRID */}
            <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                {products.map(product => (
                    <div key={product.id} className="group border border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl transition">
                        <div className="relative w-full aspect-3/4 bg-neutral-800">
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="p-4">
                            <h2 className="font-serif text-lg group-hover:text-neutral-100 transition">{product.name}</h2>
                            <p className="text-neutral-500 text-sm mt-1">${product.price}</p>
                            {product.description && <p className="text-neutral-500 text-xs mt-2">{product.description}</p>}
                        </div>
                    </div>
                ))}
            </section>

            {/* CHAT WIDGET */}
            <ChatWidget />
        </main>
    );
}
