type ProductGalleryProps = {
    images: string[];
    name: string;
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
    const [hero, ...rest] = images;

    return (
        <div className="space-y-4">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.03]">
                {hero ? (
                    <img src={hero} alt={name} className="h-full w-full object-cover" />
                ) : null}
            </div>

            {rest.length ? (
                <div className="grid grid-cols-4 gap-3">
                    {rest.slice(0, 4).map((src) => (
                        <div
                            key={src}
                            className="aspect-square overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03]"
                        >
                            <img src={src} alt={name} className="h-full w-full object-cover" />
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
