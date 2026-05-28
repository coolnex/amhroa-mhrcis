import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "AMHROA MHRCIS",
  description:
    "Africa Mental Health Reform Intelligence System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}