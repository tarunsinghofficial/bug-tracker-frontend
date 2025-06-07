"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/authContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FolderOpen,
  Activity,
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";

const Projects = () => {
  const [allProjects, setAllProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_active: true,
  });
  const { user } = useAuth();
  const { toast } = useToast();

  // API Functions
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const getAllProjects = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/projects/`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        const detailedError = errorData.detail;
        toast({
          title: "Error fetching Projects",
          description: detailedError,
          variant: "destructive",
        });
        throw new Error(errorData.detail || "Failed to fetch projects");
      }

      const data = await res.json();
      console.log("Fetched all projects:", data);
      setAllProjects(data);
      return data;
    } catch (error) {
      console.error("Error fetching all projects:", error);
      return [];
    }
  };

  const getMyProjects = async () => {
    try {
      // Filter projects where user is the PM or has assigned issues
      // For now, we'll filter from all projects where pm_id matches user id
      // or we can create a separate endpoint for user's projects
      const allProjectsData = await getAllProjects();
      const userProjects = allProjectsData.filter(
        (project) => project.pm_id === user?.id
      );
      setMyProjects(userProjects);
      return userProjects;
    } catch (error) {
      const detailedError = error.detail;
      toast({
        title: "Error fetching Projects",
        description: detailedError,
        variant: "destructive",
      });
      console.error("Error fetching my projects:", error);
      return [];
    }
  };

  const createProject = async () => {
    try {
      setIsCreating(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/projects/`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        const detailedError = errorData.detail;
        toast({
          title: "Project Creation Failed",
          description: detailedError,
          variant: "destructive",
        });
        throw new Error(errorData.detail || "Failed to create project");
      }

      const newProject = await res.json();
      console.log("Created project:", newProject);

      // Refresh data
      await getAllProjects();
      await getMyProjects();

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActiveChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      is_active: checked,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      is_active: true,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      createProject();
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      getAllProjects();
      getMyProjects();
    }
  }, [user]);

  // Project Card Component
  const ProjectCard = ({ project }) => {
    const completionRate =
      project.issues_count > 0
        ? Math.round((project.completed_issues / project.issues_count) * 100)
        : 0;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {project.title}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge
                className={
                  project.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                <Activity className="w-3 h-3 mr-1" />
                {project.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="line-clamp-3">
            {project.description || "No description provided"}
          </CardDescription>

          {/* Project Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Total Issues
                </span>
              </div>
              <p className="text-xl font-bold text-blue-700">
                {project.issues_count || 0}
              </p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Completed
                </span>
              </div>
              <p className="text-xl font-bold text-green-700">
                {project.completed_issues || 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Open Issues
                </span>
              </div>
              <p className="text-xl font-bold text-orange-700">
                {project.open_issues || 0}
              </p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Progress
                </span>
              </div>
              <p className="text-xl font-bold text-purple-700">
                {completionRate}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {project.issues_count > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Project Progress</span>
                <span>{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            {project.project_manager_name && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="font-medium">PM:</span>
                <span>{project.project_manager_name}</span>
              </div>
            )}

            {project.created_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Created:</span>
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-gray-500">
              ID: {project.id.split("-")[0]}...
            </span>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-black">Projects</h2>
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create Project</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new project.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="Enter project title"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description" className="text-right mt-2">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="Enter project description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="is_active" className="text-right">
                        Active
                      </Label>
                      <div className="col-span-3 flex items-center space-x-2">
                        <Checkbox
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={handleActiveChange}
                        />
                        <Label htmlFor="is_active" className="text-sm">
                          Project is active
                        </Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating || !formData.title.trim()}
                    >
                      {isCreating ? "Creating..." : "Create Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Projects Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              All Projects ({allProjects.length})
            </TabsTrigger>
            <TabsTrigger value="my">
              My Projects ({myProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {allProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No projects found. Create your first project!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {myProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No projects assigned to you as Project Manager yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default Projects;
