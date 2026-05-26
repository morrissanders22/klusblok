export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 bg-[#f7f9fc] py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4">{children}</div>
    </div>
  );
}
