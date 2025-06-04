import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/authContext";
import { Toaster } from "@/components/ui/toaster";

const roboto = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export const metadata = {
  title: "Bug Tracker Tool",
  description: "A simple bug tracker tool built with Next.js and Tailwind CSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${roboto.variable}`}>
        <AuthProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Fixed Navbar at top */}
            <div className="fixed top-0 left-0 right-0 z-50">
              <Navbar />
            </div>

            {/* Fixed Sidebar */}
            <div className="fixed top-16 left-0 bottom-0 z-40 overflow-y-auto">
              <Sidebar />
            </div>

            {/* Main content area - scrollable */}
            <div className="flex flex-col w-full pt-16">
              <main className="flex-1 ml-64 p-4 md:p-6 overflow-y-auto h-[calc(100vh-64px)]">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
