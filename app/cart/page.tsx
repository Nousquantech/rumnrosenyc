import { Container } from "@/components/ui/Container";

export default async function CartPage() {
    return (
        <Container className="py-12">
            <h1 className="text-4xl tracking-tight">Cart</h1>
            <p className="mt-3 max-w-2xl text-sm text-foreground/70">
                Cart is a UI placeholder — no backend or persistence.
            </p>
            <div className="mt-10 rounded-2xl border border-foreground/10 p-8 text-sm text-foreground/70">
                Cart items + totals go here.
            </div>
        </Container>
    );
}
