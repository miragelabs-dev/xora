export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full border-x border-border flex flex-col">
      {children}
    </div>
  );
}

