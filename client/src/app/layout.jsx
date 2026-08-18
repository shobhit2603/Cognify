import "./globals.css";
import Providers from "./providers";
import AuthInitializer from "../features/auth/components/AuthInitializer";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export const metadata = {
  title: "Cognify ✻ AI Productivity Workspace",
  description: "Unified AI workspace for documents, code synthesis, ATS resumes, and research.",
  icons: {
    icon: "/Cognify-Logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-brand-white text-brand-black selection:bg-brand-orange selection:text-white">
        <Providers>
          <AuthInitializer>
            <Navbar />
            <main className="grow pt-24">{children}</main>
            <Footer />
          </AuthInitializer>
        </Providers>
      </body>
    </html>
  );
}
