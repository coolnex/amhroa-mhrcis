import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "AMHROA",
  description:
    "African Mental Health Reform Observatory & Analytics",

  openGraph: {
    title: "AMHROA",
    description:
      "African Mental Health Reform Observatory & Analytics",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
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