"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User } from "lucide-react";
import { useAuth } from "@/lib/authContext"; // Import auth context
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Assuming you have this component
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const router = useRouter();
  // Replace mock state with actual auth context
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout(); // Use the logout function from auth context
    // No need to navigate manually as the context will handle it
  };

  // Generate initials for the avatar
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
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-xl font-bold">
          ProjectSync
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className="px-3 py-2 text-sm font-medium">
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {isAuthenticated && (
                <>
                  <NavigationMenuItem>
                    <Link href="/dashboard/projects" legacyBehavior passHref>
                      <NavigationMenuLink className="px-3 py-2 text-sm font-medium">
                        Projects
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/dashboard/issues" legacyBehavior passHref>
                      <NavigationMenuLink className="px-3 py-2 text-sm font-medium">
                        Issues
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth Buttons or User Info */}
          {isAuthenticated ? (
            <>
              <div className="flex items-center mr-2">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                </Avatar>
                <div className="text-sm flex  items-center gap-1">
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    ({user?.role || "User"})
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            {isAuthenticated && (
              <div className="flex items-center gap-2 py-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.role || "User"}
                  </p>
                </div>
              </div>
            )}
            <div className="grid gap-2 py-4">
              <Link href="/" className="px-3 py-2 text-sm font-medium">
                Home
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/projects"
                    className="px-3 py-2 text-sm font-medium"
                  >
                    Projects
                  </Link>
                  <Link
                    href="/dashboard/issues"
                    className="px-3 py-2 text-sm font-medium"
                  >
                    Bugs
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
    </nav>
  );
};

export default Navbar;
