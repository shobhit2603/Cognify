import "./globals.css";
import Providers from "./providers";
import AuthInitializer from "../features/auth/components/AuthInitializer";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Caveat } from "next/font/google";

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
    <html lang="en" className={`h-full antialiased selection:bg-osmo-lime selection:text-osmo-dark ${caveat.variable}`}>
      <body className="min-h-full flex flex-col bg-osmo-bg text-osmo-dark font-sans">
        <Providers>
          <AuthInitializer>
            <Navbar />
            <main className="grow pt-28 sm:pt-32">{children}</main>
            <Footer />
          </AuthInitializer>
        </Providers>
      </body>
    </html>
  );
}