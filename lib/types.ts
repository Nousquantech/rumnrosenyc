export type Gender = "women" | "men" | "kids";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  gender: Gender;
  price: number;
  images: string[];
  description: string;
  tags?: Array<"new" | "featured">;
};

export type Collection = {
  slug: string;
  name: string;
  season: string;
  description: string;
  productSlugs: string[];
};

export type CategoryGroup = {
  group: "Women" | "Men" | "Kids";
  categories: Array<{ label: string; href: string }>;
};
