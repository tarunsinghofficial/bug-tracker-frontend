"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BugOff,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Folder,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/hooks/use-toast";

const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Don't render sidebar on the home, login, and register pages
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    logout();
    // Optionally redirect to home or login page after logout
    window.location.href = "/";
  };

  const sidebarItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: <Folder className="h-5 w-5" />,
    },
    {
      name: "Issues",
      href: "/issues",
      icon: <BugOff className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={`h-screen border-r bg-background transition-all duration-300 relative hidden md:block ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-2 flex flex-col h-[90%] justify-between">
        <Button
          variant="outline"
          size="icon"
          className="absolute right-[-12px] top-4 h-6 w-6 rounded-full border bg-background"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        <div className="flex flex-col h-full">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <div className="flex h-8 items-center justify-center">
                {!isCollapsed && (
                  <h2 className="text-lg font-semibold tracking-tight">
                    Bug Tracker
                  </h2>
                )}
                {isCollapsed && <BugOff className="h-6 w-6" />}
              </div>
            </div>
            <div className="px-3 py-2">
              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size={isCollapsed ? "icon" : "default"}
                      className={`w-full justify-${
                        isCollapsed ? "center" : "start"
                      } ${
                        pathname === item.href
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {item.icon}
                      {!isCollapsed && (
                        <span className="ml-2">{item.name}</span>
                      )}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* Logout button */}
          <div className="p-4 border-t mt-auto">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground hover:text-red-500 hover:border-red-200"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
