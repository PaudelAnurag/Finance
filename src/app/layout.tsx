import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { CurrencyProvider } from "@/lib/currency";
import { ApiSettingsProvider } from "@/lib/api-settings";
import { DatasetProvider } from "@/lib/dataset/context";
import { HydrationGate } from "@/lib/hydration";
import { SettingsProvider } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Finance OS",
  description: "AI finance department for SMEs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen">
        <CurrencyProvider>
          <SettingsProvider>
            <ApiSettingsProvider>
              <DatasetProvider>
                <HydrationGate>{children}</HydrationGate>
              </DatasetProvider>
            </ApiSettingsProvider>
          </SettingsProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
