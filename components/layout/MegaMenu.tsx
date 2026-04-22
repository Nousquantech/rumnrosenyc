import Link from "next/link";

type MenuGroup = {
    title: string;
    links: Array<{ label: string; href: string }>;
};

type MegaMenuProps = {
    groups: MenuGroup[];
    open?: boolean;
    onClose?: () => void;
};

export function MegaMenu({ groups, open = false, onClose }: MegaMenuProps) {
    return (
        <>
            <button
                type="button"
                className={"fixed inset-0 z-30 " + (open ? "block" : "hidden")}
                aria-label="Close menu"
                onClick={onClose}
            />
            <div className={"fixed left-0 right-0 top-16 z-40 pt-4 " + (open ? "block" : "hidden")}>
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
                                                onClick={onClose}
                                                className="transition-opacity hover:opacity-60"
                                                style={{ color: "var(--rr-ink)" }}
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
        </>
    );
}
