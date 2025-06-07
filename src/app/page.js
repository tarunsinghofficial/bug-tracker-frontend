"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Hero from "../../public/images/Hero.png";
import { useAuth } from "@/lib/authContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Neon Glow Light in Center */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-30 blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-screen px-6 lg:px-20 gap-16">
        {/* Left Content */}
        <div className="flex-1 w-full lg:w-1/2 flex flex-col justify-center items-start text-left py-12">
          <div className="bg-gray-900 text-white px-4 py-1 border-[1px] border-blue-600/50 rounded-full text-sm font-medium mb-4">
            ProjectSync
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
            Manage your <span className="text-blue-600">Projects</span> and{" "}
            <span className="text-purple-600">Issues</span> seamlessly
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
            Streamline your development workflow and manage your team’s projects
            and issues more efficiently with our powerful tool.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {user ? (
              <h2 className="text-blue-600 text-2xl">
                Welcome back,{" "}
                <span className="text-white font-bold">{user?.username}</span>!
              </h2>
            ) : (
              <Link href="/register" passHref>
                <Button className="px-8 py-3 text-lg font-semibold rounded-full bg-blue-600 hover:bg-blue-700 transition-colors">
                  Get Started
                </Button>
              </Link>
            )}
            {user ? (
              <Link href="/dashboard" passHref>
                <Button
                  variant="outline"
                  className="px-8 py-3 bg-transparent text-lg rounded-full border-2 border-blue-600 text-white transition-colors"
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login" passHref>
                <Button
                  variant="outline"
                  className="px-8 py-3 text-lg font-semibold rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Right Hero Image */}
        <div className="w-full lg:w-1/2 flex justify-end items-center h-[300px] lg:h-[80vh] overflow-hidden rounded-xl shadow-xl mt-8 lg:mt-0">
          <Image
            src={Hero}
            alt="ProjectSync - Project and Issue Management Tool"
            width={3000}
            height={3000}
            className="w-auto h-full object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
