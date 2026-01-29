export type BackendProduct = {
    id: string;
    name: string;
    category: string;
    price: number;
    sizes: string;
    colors: string;
    material: string;
    fit: string;
    style: string;
    description: string;
};

export interface PaginatedProducts {
    items: BackendProduct[];
    total: number;
    limit: number;
    offset: number;
}

function getApiBaseUrl(): string {
    const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (configured && configured.trim()) return configured.trim();
    return "http://localhost:8000";
}

function normalizeApiUrl(path: string): string {
    const base = getApiBaseUrl().replace(/\/$/, "");
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `${base}${suffix}`;
}

export async function fetchProducts(options?: { limit?: number; offset?: number }): Promise<PaginatedProducts[]> {
    const limit = options?.limit ?? 24;
    const offset = options?.offset ?? 0;

    const url = normalizeApiUrl(`/products?limit=${encodeURIComponent(String(limit))}&offset=${encodeURIComponent(String(offset))}`);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
    return (await res.json()) as PaginatedProducts[];
}

export async function fetchProductById(id: string): Promise<BackendProduct | null> {
    const url = normalizeApiUrl(`/products/${encodeURIComponent(id)}`);
    try{
        const res = await fetch(url, { cache: "no-store" });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
        const data = await res.json();
        return data as BackendProduct;
        
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }   
}
