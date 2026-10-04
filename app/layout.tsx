import "./globals.css";

export const metadata = {
  title: "Readora - eBook Library",
  description: "A professional digital reading library.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
