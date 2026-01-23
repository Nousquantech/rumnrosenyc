import Image from "next/image";
import ChatWidget from "./components/ChatWidget";
import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-[#0B1726] text-neutral-100">
      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-5xl text-center">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight">
            Rum&Rose
          </h1>
          <p className="mt-6 text-lg md:text-xl text-neutral-400">
            Premium denim. Crafted with restraint. Designed to endure.
          </p>
          <div className="mt-10">
            <Link href="/collection" className="border border-neutral-600 px-8 py-3 text-sm tracking-wide uppercase hover:bg-neutral-100 hover:text-neutral-900 transition">
              View Collection
            </Link>
          </div>
        </div>
      </section>


      {/* BRAND PHILOSOPHY */}
      <section className="py-24 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif">The House</h2>
            <p className="mt-6 text-neutral-400 leading-relaxed">
              Rum&Rose is a premium denim fashion house built on contrast — strength and softness,
              structure and ease, heritage and restraint. Every garment is designed to age with character.
            </p>
          </div>
          <div className="aspect-4/5 bg-neutral-800" />
        </div>
      </section>


      {/* COLLECTION PREVIEW */}
      <section className="py-24 px-6 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-12">Collection</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="group">
                <div className="aspect-3/4 bg-neutral-800" />
                <p className="mt-4 text-sm tracking-wide">Selvedge Denim Jacket</p>
                <p className="text-xs text-neutral-500">Raw Indigo</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-neutral-800 text-sm text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6">
          <p>© {new Date().getFullYear()} Rum&Rose</p>
          <div className="flex gap-6">
            <a className="hover:text-neutral-200" href="#">Instagram</a>
            <a className="hover:text-neutral-200" href="#">Contact</a>
          </div>
        </div>
      </footer>
      {/* CHAT WIDGET */}
      <ChatWidget />
    </main>
  );
}
