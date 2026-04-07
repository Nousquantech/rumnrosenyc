import { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
    children: ReactNode;
    variant?: ButtonVariant;
};

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
    const base =
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm transition-colors disabled:opacity-50";

    const variants: Record<ButtonVariant, string> = {
        primary: "bg-foreground text-background hover:bg-foreground/90",
        ghost: "border border-foreground/15 hover:border-foreground/25",
    };

    return (
        <button
            className={[base, variants[variant], className].filter(Boolean).join(" ")}
            {...props}
        >
            {children}
        </button>
    );
}
