"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/20 bg-transparent text-blue-500">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          ProjectSync
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-4">
              {isAuthenticated && (
                <>
                  <NavigationMenuItem>
                    <Link href="/dashboard/projects" legacyBehavior passHref>
                      <NavigationMenuLink className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Projects
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/dashboard/issues" legacyBehavior passHref>
                      <NavigationMenuLink className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Issues
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth / User */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
              </Avatar>
              <div className="text-sm leading-tight">
                <p className="font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role || "User"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              {isAuthenticated && (
                <div className="flex items-center gap-2 py-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(user?.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.role || "User"}
                    </p>
                  </div>
                </div>
              )}
              <div className="grid gap-3 py-4">
                <Link href="/" className="text-sm font-medium">
                  Home
                </Link>

                {isAuthenticated && (
                  <>
                    <Link
                      href="/dashboard/projects"
                      className="text-sm font-medium"
                    >
                      Projects
                    </Link>
                    <Link
                      href="/dashboard/issues"
                      className="text-sm font-medium"
                    >
                      Issues
                    </Link>
                  </>
                )}

                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full mt-4"
                  >
                    Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/login")}
                      className="w-full"
                    >
                      Login
                    </Button>
                    <Button className="w-full">
                      <Link href="/register" className="w-full">
                        Register
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
