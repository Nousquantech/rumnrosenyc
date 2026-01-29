import Link from "next/link";

export const metadata = {
    title: "Contact — Rum&Rose"
};

export default function ContactPage() {
    return (
        <main className="bg-[#0B1726] text-neutral-100">
            <section className="mx-auto max-w-3xl px-6 py-20">
                <h1 className="font-serif text-4xl md:text-5xl">Contact</h1>
                <p className="mt-4 max-w-2xl text-neutral-400">
                    For styling help, sizing guidance, or press inquiries, reach out and our concierge will respond.
                </p>

                <div className="mt-10 grid gap-6 rounded-2xl border border-neutral-800 bg-[#0B1726]/40 p-6 md:grid-cols-2">
                    <div>
                        <div className="text-xs uppercase tracking-wide text-neutral-500">Email</div>
                        <div className="mt-2 text-neutral-200">concierge@rumandrose.com</div>

                        <div className="mt-6 text-xs uppercase tracking-wide text-neutral-500">Hours</div>
                        <div className="mt-2 text-neutral-200">Mon–Fri · 10:00–18:00</div>

                        <div className="mt-6">
                            <Link href="/collection" className="text-sm text-neutral-200 underline underline-offset-4 hover:text-white">
                                Browse the collection
                            </Link>
                        </div>
                    </div>

                    <form className="space-y-4">
                        <label className="block">
                            <span className="text-xs uppercase tracking-wide text-neutral-500">Name</span>
                            <input
                                className="mt-2 w-full rounded-lg border border-neutral-800 bg-[#0B1726] px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#D9AC84]/40"
                                placeholder="Your name"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs uppercase tracking-wide text-neutral-500">Email</span>
                            <input
                                type="email"
                                className="mt-2 w-full rounded-lg border border-neutral-800 bg-[#0B1726] px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#D9AC84]/40"
                                placeholder="you@example.com"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs uppercase tracking-wide text-neutral-500">Message</span>
                            <textarea
                                rows={4}
                                className="mt-2 w-full rounded-lg border border-neutral-800 bg-[#0B1726] px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#D9AC84]/40"
                                placeholder="How can we help?"
                            />
                        </label>
                        <button
                            type="button"
                            className="w-full rounded-lg border border-neutral-700 bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-white"
                        >
                            Send
                        </button>
                        <p className="text-xs text-neutral-500">
                            Demo form (not wired to email).
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
