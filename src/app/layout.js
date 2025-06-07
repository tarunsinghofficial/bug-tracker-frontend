import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "@/lib/authContext";
import { Toaster } from "@/components/ui/toaster";

const roboto = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export const metadata = {
  title: "ProjectSync - Project and Issue Management Tool",
  description:
    "A simple and advanced project and issue management tool built with Next.js and Tailwind CSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} w-full`}>
        <AuthProvider>
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
