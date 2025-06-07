import { Roboto_Mono } from "next/font/google";
import "./../globals.css";
import Navbar from "@/components/Navbar";

const roboto = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export const metadata = {
  title: "Register or Login for ProjectSync",
  description: "An advanced Project and Issue Management Tool",
};

export default function AuthLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="flex flex-col w-full pt-16">
        <main className="flex-1 p-4 md:p-6 overflow-y-auto h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
