import Link from "next/link";

type MenuGroup = {
    title: string;
    links: Array<{ label: string; href: string }>;
};

type MegaMenuProps = {
    groups: MenuGroup[];
};

export function MegaMenu({ groups }: MegaMenuProps) {
    return (
        <div className="absolute left-0 right-0 top-full hidden pt-4 group-hover:block group-focus-within:block">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-foreground/10 bg-background/95 p-8 backdrop-blur">
                    <div className="grid gap-8 md:grid-cols-3">
                        {groups.map((group) => (
                            <div key={group.title} className="space-y-4">
                                <div className="text-xs tracking-[0.2em] text-foreground/60">
                                    {group.title}
                                </div>
                                <div className="grid gap-3 text-sm">
                                    {group.links.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="transition-colors hover:text-foreground/70"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
