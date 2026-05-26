import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="flex-1 flex flex-col bg-[#f7f9fc]">{children}</main>
      <Footer />
    </>
  );
}
