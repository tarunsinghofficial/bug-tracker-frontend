"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  FolderKanban,
  Users,
  ArrowUpCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/ProtectedRoute";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalIssues: 0,
    openIssues: 0,
    completedIssues: 0,
    highPriorityIssues: 0,
    recentIssues: [],
    recentProjects: [],
  });
  const [loading, setLoading] = useState(true);

  // Format greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Status configuration for styling
  const statusConfig = {
    OPEN: { color: "bg-blue-100 text-blue-800", label: "Open" },
    IN_PROGRESS: {
      color: "bg-purple-100 text-purple-800",
      label: "In Progress",
    },
    COMPLETED: { color: "bg-green-100 text-green-800", label: "Completed" },
    ASSIGNED: { color: "bg-yellow-100 text-yellow-800", label: "Assigned" },
    REVIEW: { color: "bg-orange-100 text-orange-800", label: "Review" },
  };

  // Priority configuration for styling
  const priorityConfig = {
    LOW: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    MEDIUM: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    HIGH: { color: "bg-red-100 text-red-800", icon: AlertCircle },
  };

  // API call to get dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      // Get statistics
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        console.error("Failed to fetch dashboard stats");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  // Fallback data if API doesn't yet have this endpoint
  useEffect(() => {
    if (!loading && stats.totalProjects === 0) {
      // Fallback to manually fetching basic stats
      const fetchBasicStats = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          // Fetch projects count
          const projectsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/projects/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Fetch issues count
          const issuesRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/issues/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (projectsRes.ok && issuesRes.ok) {
            const projects = await projectsRes.json();
            const issues = await issuesRes.json();

            // Count by status
            const openIssues = issues.filter(
              (issue) => issue.status === "OPEN"
            ).length;
            const completedIssues = issues.filter(
              (issue) =>
                issue.status === "COMPLETED" || issue.status === "REVIEW"
            ).length;
            const highPriorityIssues = issues.filter(
              (issue) => issue.priority === "HIGH"
            ).length;

            setStats({
              totalProjects: projects.length,
              totalIssues: issues.length,
              openIssues,
              completedIssues,
              highPriorityIssues,
              recentIssues: issues.slice(0, 3),
              recentProjects: projects.slice(0, 3),
            });
          }
        } catch (error) {
          console.error("Error fetching fallback stats:", error);
        }
      };

      fetchBasicStats();
    }
  }, [loading, stats.totalProjects]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col space-y-6">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {user?.username || "there"}!
          </h1>
          <p className="text-blue-100">
            Welcome to your ProjectSync dashboard. Here's an overview of your
            projects and issues.
          </p>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active project workspaces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Issues
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalIssues}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openIssues}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Issues needing attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                High Priority
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.highPriorityIssues}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Urgent issues to address
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Tabs for Recent Activity */}
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="issues">Recent Issues</TabsTrigger>
            <TabsTrigger value="projects">Recent Projects</TabsTrigger>
          </TabsList>

          {/* Recent Issues Tab */}
          <TabsContent value="issues" className="space-y-4 mt-4">
            {stats.recentIssues && stats.recentIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.recentIssues.map((issue, index) => (
                  <Card
                    key={issue.id || index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {issue.title}
                        </CardTitle>
                        <Badge
                          className={
                            statusConfig[issue.status]?.color || "bg-gray-100"
                          }
                        >
                          {statusConfig[issue.status]?.label || issue.status}
                        </Badge>
                      </div>
                      {issue.project_title && (
                        <CardDescription className="text-xs">
                          Project: {issue.project_title}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm line-clamp-2">
                        {issue.description || "No description provided"}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 text-xs text-gray-500">
                      {issue.created_at && (
                        <span>
                          Created:{" "}
                          {new Date(issue.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent issues found.
              </div>
            )}
          </TabsContent>

          {/* Recent Projects Tab */}
          <TabsContent value="projects" className="space-y-4 mt-4">
            {stats.recentProjects && stats.recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.recentProjects.map((project, index) => (
                  <Card
                    key={project.id || index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {project.issue_count !== undefined && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">
                            {project.issue_count} Issues
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="text-xs text-gray-500">
                      {project.created_at && (
                        <span>
                          Created:{" "}
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent projects found.
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions Section */}
        {user?.role === "PM" && (
          <section className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 mt-2">
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Project Manager Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Review {stats.openIssues} open issues</li>
                  <li>
                    Prioritize {stats.highPriorityIssues} high priority tasks
                  </li>
                  <li>Assign unassigned issues to team members</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Team Performance</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <span className="font-medium">
                      {stats.totalIssues
                        ? Math.round(
                            (stats.completedIssues / stats.totalIssues) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{
                        width: `${
                          stats.totalIssues
                            ? Math.round(
                                (stats.completedIssues / stats.totalIssues) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
