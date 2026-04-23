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
    slug: "aurora-mini-dress",
    name: "Aurora Mini Dress",
    category: "Dress",
    gender: "women",
    price: 285,
    old: 380,
    sale: true,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
  {
    id: "w-002",
    slug: "wrap-slip-dress",
    name: "Wrap Slip Dress",
    category: "Dress",
    gender: "women",
    price: 320,
    old: 320,
    sale: false,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
    {
    id: "w-003",
    slug: "aurora-mini-dress",
    name: "Aurora Mini Skirt",
    category: "Skirt",
    gender: "women",
    price: 195,
    old: 260,
    sale: true,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
    {
    id: "w-004",
    slug: "pleated-maxi-skirt",
    name: "Pleated maxi skirt",
    category: "Skirt",
    gender: "women",
    price: 240,
    old: 240,
    sale: false,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
      {
    id: "w-005",
    slug: "wide-leg-trousers",
    name: "Wide-leg trousers",
    category: "Pants",
    gender: "women",
    price: 260,
    old: 340,
    sale: true,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
      {
    id: "w-006",
    slug: "structured-vest",
    name: "Structured vest",
    category: "Vest",
    gender: "women",
    price: 210,
    old: 210,
    sale: false,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
  {
    id: "w-007",
    slug: "aurora-mini-dress",
    name: "Aurora Mini Dress",
    category: "Dress",
    gender: "women",
    price: 285,
    old: 380,
    sale: true,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
  {
    id: "w-008",
    slug: "wrap-slip-dress",
    name: "Wrap Slip Dress",
    category: "Dress",
    gender: "women",
    price: 320,
    old: 320,
    sale: false,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
    {
    id: "w-009",
    slug: "aurora-mini-dress",
    name: "Aurora Mini Skirt",
    category: "Skirt",
    gender: "women",
    price: 195,
    old: 260,
    sale: true,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
    {
    id: "w-010",
    slug: "pleated-maxi-skirt",
    name: "Pleated maxi skirt",
    category: "Skirt",
    gender: "women",
    price: 240,
    old: 240,
    sale: false,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
      {
    id: "w-011",
    slug: "wide-leg-trousers",
    name: "Wide-leg trousers",
    category: "Pants",
    gender: "women",
    price: 260,
    old: 340,
    sale: true,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
  },
      {
    id: "w-012",
    slug: "structured-vest",
    name: "Structured vest",
    category: "Vest",
    gender: "women",
    price: 210,
    old: 210,
    sale: false,
    images: ["/products/women-bag-2a.svg", "/products/women-bag-2b.svg"],
    description:
      "Compact proportions, refined structure, and a soft sheen finish designed for day-to-evening transitions.",
    tags: ["featured", "new"],
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
