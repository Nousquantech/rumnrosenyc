import Hero from "@/components/sections/Hero";
import Featured from "@/components/sections/Featured";
// import Highlights from "@/components/sections/Highlights";
import SaleBanner from "@/components/sections/SaleBanner";

export default async function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <SaleBanner />
      <Featured />
      {/* <Highlights /> */}
    </div>
  );
}