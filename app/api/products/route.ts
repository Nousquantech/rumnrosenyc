import { NextResponse } from "next/server";

import { getProducts } from "@/lib/data";
import type { Gender } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const gender = url.searchParams.get("gender") as Gender | null;
  const category = url.searchParams.get("category");
  const tag = url.searchParams.get("tag") as "new" | "featured" | null;

  const products = await getProducts({
    gender: gender ?? undefined,
    category: category ?? undefined,
    tag: tag ?? undefined,
  });

  return NextResponse.json({ products });
}
