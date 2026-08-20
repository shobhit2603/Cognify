import "./globals.css";
import Providers from "./providers";
import AuthInitializer from "../features/auth/components/AuthInitializer";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Caveat } from "next/font/google";

import MainLayoutWrapper from "../components/layout/MainLayoutWrapper";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata = {
  title: "Cognify ✻ Intelligent Workspace",
  description: "Creative AI workspace for documents, contextual research, and generative intelligence.",
  icons: {
    icon: "/Cognify-Logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`antialiased selection:bg-osmo-lime selection:text-osmo-dark ${caveat.variable}`}>
      <body className="min-h-screen flex flex-col bg-osmo-bg text-osmo-dark font-sans">
        <Providers>
          <AuthInitializer>
            <Navbar />
            <MainLayoutWrapper>{children}</MainLayoutWrapper>
            <Footer />
          </AuthInitializer>
        </Providers>
      </body>
    </html>
  );
}