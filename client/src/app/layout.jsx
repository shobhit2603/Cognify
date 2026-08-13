import "./globals.css";

export const metadata = {
  title: "Cognify",
  description: "AI-powered productivity workspace",
  icons: {
    icon: "/Cognify-Logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={` h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
