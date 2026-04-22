import type { ReactNode } from "react";

type SectionProps = {
    children: ReactNode;
    className?: string;
    innerClassName?: string;
    style?: React.CSSProperties;
};

export function Section({ children, className, innerClassName, style }: SectionProps) {
    return (
        <section
            className={"py-28 px-6 md:px-16 " + (className ?? "")}
            style={style}
        >
            <div className={"w-full " + (innerClassName ?? "")}>{children}</div>
        </section>
    );
}