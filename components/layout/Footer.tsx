import Link from "next/link";

import { Container } from "@/components/ui/Container";

export function Footer() {
    return (

        <footer className="border-t border-gray-200 text-sm text-gray-400">
            <Container className="flex justify-between items-center py-6">
                <p>© 2026 Rumnrose NYC</p>

                <div className="flex gap-6">
                    <Link href="/ourstory" className="hover:text-white transition">
                        Our story
                    </Link>
                    <Link href="/returns" className="hover:text-white transition">
                        Returns
                    </Link>
                    <Link href="https://instagram.com" className="hover:text-white transition">
                        Instagram
                    </Link>
                </div>
            </Container>
        </footer>


    );
}

