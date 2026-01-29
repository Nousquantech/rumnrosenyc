export type Product = {
    id: string;
    name: string;
    price: number;
    fit: "Slim" | "Straight" | "Relaxed";
    wash: "Indigo" | "Black" | "Light";
    description: string;
};

export const PRODUCTS: Product[] = [
    {
        id: "selvedge-slim-indigo",
        name: "Selvedge Slim Jean",
        price: 148,
        fit: "Slim",
        wash: "Indigo",
        description:
            "A clean slim silhouette with classic indigo depth. Premium denim with a refined feel."
    },
    {
        id: "straight-classic-indigo",
        name: "Straight Classic Jean",
        price: 128,
        fit: "Straight",
        wash: "Indigo",
        description:
            "Everyday straight fit with room to move. A versatile midweight denim for daily wear."
    },
    {
        id: "relaxed-90s-light",
        name: "Relaxed 90s Jean",
        price: 118,
        fit: "Relaxed",
        wash: "Light",
        description:
            "Relaxed, easy, and slightly oversized. A light wash that pairs with anything."
    },
    {
        id: "slim-black-rinse",
        name: "Slim Black Rinse Jean",
        price: 138,
        fit: "Slim",
        wash: "Black",
        description:
            "Sharp black rinse with a tailored slim line. Polished enough for nights out."
    },
    {
        id: "straight-black-work",
        name: "Straight Black Work Jean",
        price: 124,
        fit: "Straight",
        wash: "Black",
        description:
            "Straight leg with a durable hand. A black wash built for repeat wears."
    }
];

export function getProductById(id: string): Product | undefined {
    return PRODUCTS.find((p) => p.id === id);
}
