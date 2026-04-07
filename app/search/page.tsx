import { Container } from "@/components/ui/Container";

export default async function SearchPage() {
    return (
        <Container className="py-12">
            <h1 className="text-4xl tracking-tight">Search</h1>
            <p className="mt-3 max-w-2xl text-sm text-foreground/70">
                Search UI placeholder. Hook this up to your preferred search provider.
            </p>
            <div className="mt-10 rounded-2xl border border-foreground/10 p-8 text-sm text-foreground/70">
                Search input + results grid goes here.
            </div>
        </Container>
    );
}
