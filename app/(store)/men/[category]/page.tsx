import { CategoryPage } from "@/components/product/CategoryPage";

type PageProps = {
    params: Promise<{ category: string }>;
};

export default async function MenCategoryPage({ params }: PageProps) {
    const { category } = await params;
    return (
        <CategoryPage
            gender="men"
            category={category}
            title={titleFromCategory(category)}
        />
    );
}

function titleFromCategory(category: string) {
    return category
        .split("-")
        .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
        .join(" ");
}
