import "./globals.css";

import ChatWidget from "./components/ChatWidget";
import TopNav from "./components/TopNav";

export const metadata = {
    title: "Denim Assistant",
    description: "AI-powered denim retail assistant"
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-[#0B1726]">
                <TopNav />
                <div className="pt-16">{children}</div>

                <ChatWidget />
            </body>
        </html>
    );
}
