import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers/Providers";
import { appConfig } from "@/lib/entities-registry";

export const metadata: Metadata = {
  title: appConfig.name,
  description: "Application générée par stockpro-backend-generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
