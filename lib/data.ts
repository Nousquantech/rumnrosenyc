import { cache } from "react";

import type { CategoryGroup, Collection, Gender, Product } from "@/lib/types";

type ProductQuery = {
  gender?: Gender;
  category?: string;
  tag?: "new" | "featured";
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const mockProducts: Product[] = [
  {
    id: "w-001",
    slug: "aurora-mini-shoulder-bag",
    name: "Aurora Mini Shoulder Bag",
    category: "bags",
    gender: "women",
    price: 1890,
    images: ["/products/women-bag-1a.svg", "/products/women-bag-1b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
  {
    id: "w-002",
    slug: "atelier-leather-tote",
    name: "Atelier Leather Tote",
    category: "bags",
    gender: "women",
    price: 2450,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "A roomy silhouette finished with tonal hardware and subtle stitching for an understated statement.",
    tags: ["featured"],
  },
  {
    id: "w-003",
    slug: "sleek-heel-mule",
    name: "Sleek Heel Mule",
    category: "shoes",
    gender: "women",
    price: 980,
    images: ["/products/women-shoe-1a.svg", "/products/women-shoe-1b.svg"],
    description:
      "A sculptural heel with a clean upper for a modern, minimal line.",
    tags: ["new"],
  },
  {
    id: "w-004",
    slug: "signature-silk-scarf",
    name: "Signature Silk Scarf",
    category: "accessories",
    gender: "women",
    price: 320,
    images: ["/products/women-acc-1a.svg", "/products/women-acc-1b.svg"],
    description:
      "Lightweight silk with an abstract motif designed to elevate everyday layers.",
  },
  {
    id: "m-001",
    slug: "modern-derby",
    name: "Modern Derby",
    category: "shoes",
    gender: "men",
    price: 1090,
    images: ["/products/men-shoe-1a.svg", "/products/men-shoe-1b.svg"],
    description:
      "A sharp profile with a matte finish, built for long wear and clean styling.",
    tags: ["featured"],
  },
  {
    id: "m-002",
    slug: "structured-crossbody",
    name: "Structured Crossbody",
    category: "bags",
    gender: "men",
    price: 1290,
    images: ["/products/men-bag-1a.svg", "/products/men-bag-1b.svg"],
    description:
      "An everyday carry with architectural panels and a minimal strap system.",
    tags: ["new"],
  },
  {
    id: "m-003",
    slug: "leather-card-holder",
    name: "Leather Card Holder",
    category: "accessories",
    gender: "men",
    price: 190,
    images: ["/products/men-acc-1a.svg", "/products/men-acc-1b.svg"],
    description:
      "Slim, tactile leather with precise edges and discreet branding-free finishing.",
  },
  {
    id: "k-001",
    slug: "mini-zip-hoodie",
    name: "Mini Zip Hoodie",
    category: "ready-to-wear",
    gender: "kids",
    price: 160,
    images: ["/products/kids-1a.svg", "/products/kids-1b.svg"],
    description:
      "Soft fleece with a clean shape and comfortable rib trims.",
    tags: ["new"],
  },
];

const mockCollections: Collection[] = [
  {
    slug: "quiet-architecture",
    name: "Quiet Architecture",
    season: "Editorial",
    description:
      "Precise forms, tonal finishes, and statement materials — distilled to essentials.",
    productSlugs: ["aurora-mini-shoulder-bag", "modern-derby", "atelier-leather-tote"],
  },
  {
    slug: "soft-contrast",
    name: "Soft Contrast",
    season: "Drop",
    description:
      "Gloss and matte, structured and fluid — a small collection built for layering.",
    productSlugs: ["sleek-heel-mule", "structured-crossbody", "signature-silk-scarf"],
  },
];

export const getProducts = cache(async (query: ProductQuery = {}) => {
  const { gender, category, tag } = query;
  let result = mockProducts;

  if (gender) result = result.filter((p) => p.gender === gender);
  if (category) result = result.filter((p) => p.category === category);
  if (tag) result = result.filter((p) => p.tags?.includes(tag));

  return result;
});

export const getProductBySlug = cache(async (slug: string) => {
  return mockProducts.find((p) => p.slug === slug) ?? null;
});

export const getCategoryGroups = cache(async (): Promise<CategoryGroup[]> => {
  return [
    {
      group: "Women",
      categories: [
        { label: "New Arrivals", href: "/women/new-arrivals" },
        { label: "Bags", href: "/women/bags" },
        { label: "Shoes", href: "/women/shoes" },
        { label: "Accessories", href: "/women/accessories" },
      ],
    },
    {
      group: "Men",
      categories: [
        { label: "Bags", href: "/men/bags" },
        { label: "Shoes", href: "/men/shoes" },
        { label: "Accessories", href: "/men/accessories" },
      ],
    },
    {
      group: "Kids",
      categories: [{ label: "Shop Kids", href: "/kids" }],
    },
  ];
});

export const getCollections = cache(async () => {
  return mockCollections;
});

export const getCollectionBySlug = cache(async (slug: string) => {
  const collection = mockCollections.find((c) => c.slug === slug);
  if (!collection) return null;

  const products = collection.productSlugs
    .map((productSlug) => mockProducts.find((p) => p.slug === productSlug))
    .filter((p): p is Product => Boolean(p));

  return { ...collection, products };
});

export function ensureProductSlug(name: string, id: string) {
  return `${slugify(name)}-${id}`;
}
