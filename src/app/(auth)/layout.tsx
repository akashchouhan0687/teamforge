// Auth pages use a minimal layout — no Navbar/Footer — for a clean auth experience.
// They inherit from the root layout's html/body but override the inner structure.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
