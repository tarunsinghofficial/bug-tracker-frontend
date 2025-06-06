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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Folder,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const Issues = () => {
  const [allIssues, setAllIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [openIssues, setOpenIssues] = useState([]);
  const [createdByMeIssues, setCreatedByMeIssues] = useState([]);
  const [completedIssues, setCompletedIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showIssueStatus, setShowIssueStatus] = useState(true);
  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    priority: "LOW",
    issue_type: "BUG",
    project_id: "",
  });
  const [assignFormData, setAssignFormData] = useState({
    assigned_to_id: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();

  // Priority and status configurations
  const priorityConfig = {
    LOW: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    MEDIUM: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    HIGH: { color: "bg-red-100 text-red-800", icon: AlertCircle },
  };

  const statusConfig = {
    OPEN: { color: "bg-blue-100 text-blue-800", label: "Open" },
    IN_PROGRESS: {
      color: "bg-purple-100 text-purple-800",
      label: "In Progress",
    },
    COMPLETED: { color: "bg-gray-100 text-gray-800", label: "Completed" },
    ASSIGNED: { color: "bg-gray-100 text-gray-800", label: "Assigned" },
    REVIEW: { color: "bg-gray-100 text-gray-800", label: "Review" },
  };

  const typeConfig = {
    BUG: { color: "bg-red-50 text-red-700", label: "Bug" },
    FEATURE: { color: "bg-blue-50 text-blue-700", label: "Feature" },
    TASK: { color: "bg-green-50 text-green-700", label: "Task" },
  };

  // API Functions
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // this shows all issues assigned to current user and not created by current user
  const fetchAllIssues = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/issues/`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        setAllIssues(data);
        console.log("all issues", data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching all issues:", error);
    }
    return [];
  };

  const fetchIssuesAssignedToMe = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/issues/my-issues`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        // filter to get only issues assigned to the current user
        const filteredData = data.filter(
          (issue) => issue.assigned_to_id === user.id
        );
        console.log("filtered my issues", filteredData);
        setMyIssues(filteredData);
        return data;
      }
    } catch (error) {
      console.error("Error fetching my issues:", error);
    }
    return [];
  };

  const fetchOpenIssues = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/issues/open-issues`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        console.log("status", data);
        setOpenIssues(data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching open issues:", error);
    }
    return [];
  };
  const fetchCreatedByMeIssues = async () => {
    try {
      // Get issues from the regular my-issues endpoint or all issues
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/issues/my-issues`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        const allData = await res.json();
        console.log("all issues for filtering", allData);

        // Filter to find only issues created by the current user
        if (user && allData.length > 0) {
          const filtered = allData.filter(
            (issue) => issue.created_by_id === user.id
          );
          console.log("created by me issues (filtered)", filtered);
          setCreatedByMeIssues(filtered);
          return filtered;
        }
        setCreatedByMeIssues([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching issues created by me:", error);
      // Fallback filtering from allIssues
      if (allIssues.length > 0 && user) {
        const filtered = allIssues.filter(
          (issue) => issue.created_by_id === user.id
        );
        setCreatedByMeIssues(filtered);
        return filtered;
      }
    }
    return [];
  };

  // current bug: Whenever PM or user marks for compelte or review, it is not updating the completed issues list, as it only fetching the data which the curr user created (with compelted/review status) and not showing the issues assigned and completed by current user including created by curr.

  const fetchCompletedIssues = async () => {
    try {
      // We'll use the main issues endpoint to get ALL issues first
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/issues/`,
        { headers: getAuthHeaders() }
      );

      if (res.ok) {
        const allData = await res.json();

        // Filter to find completed/review issues that are either:
        // 1. Created by current user OR
        // 2. Assigned to current user
        if (user && allData.length > 0) {
          const filtered = allData.filter(
            (issue) =>
              (issue.status === "COMPLETED" || issue.status === "REVIEW") &&
              (issue.created_by_id === user.id ||
                issue.assigned_to_id === user.id)
          );

          console.log("completed issues (filtered from all issues)", filtered);
          setCompletedIssues(filtered);
          return filtered;
        }

        setCompletedIssues([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching completed issues:", error);

      // Fallback: Use allIssues state if API call fails
      if (allIssues.length > 0 && user) {
        const filtered = allIssues.filter(
          (issue) =>
            (issue.status === "COMPLETED" || issue.status === "REVIEW") &&
            (issue.created_by_id === user.id ||
              issue.assigned_to_id === user.id)
        );

        setCompletedIssues(filtered);
        return filtered;
      }
    }
    return [];
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/projects/`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/users/`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        console.log("users", data);
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const createIssue = async () => {
    try {
      setIsCreating(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/issues/`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(createFormData),
        }
      );
      if (res.ok) {
        const newIssue = await res.json();
        setIsCreateDialogOpen(false);
        resetCreateForm();

        // Use the helper function
        await refreshAllData();
      }
    } catch (error) {
      console.error("Error creating issue:", error);
      // Show toast for creation error
      const detailedError = error.message || "Failed to create issue.";
      toast({
        title: "Issue Creation Failed",
        description: detailedError,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const assignIssue = async () => {
    if (!selectedIssue) return;

    try {
      setIsAssigning(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/issues/${selectedIssue.id}/assign`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(assignFormData),
        }
      );
      if (res.ok) {
        setIsAssignDialogOpen(false);
        setSelectedIssue(null);
        resetAssignForm();

        // Use the helper function
        await refreshAllData();
      }
    } catch (error) {
      console.error("Error assigning issue:", error);
      // Show toast for assignment error
      const detailedError = error.message || "Failed to assign issue.";
      toast({
        title: "Issue Assignment Failed",
        description: detailedError,
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // New API function to update issue status
  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/issues/${issueId}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to update issue status:", errorData);
        const detailedError =
          errorData.detail || "Failed to update issue status.";
        toast({
          title: "Status Update Failed",
          description: detailedError,
          variant: "destructive",
        });

        // Re-fetch issues to revert the optimistic update if it failed
        if (user) {
          await refreshAllData();
        }
        throw new Error(detailedError);
      }

      // If status is being changed to COMPLETED or REVIEW, immediately
      // fetch the completed issues instead of just optimistic UI update
      if (newStatus === "COMPLETED" || newStatus === "REVIEW") {
        await refreshAllData();
      } else {
        // Optimistically update the state for other status changes
        setAllIssues((prev) =>
          prev.map((issue) =>
            issue.id === issueId ? { ...issue, status: newStatus } : issue
          )
        );

        setMyIssues((prev) =>
          prev.map((issue) =>
            issue.id === issueId ? { ...issue, status: newStatus } : issue
          )
        );

        setOpenIssues((prev) =>
          prev.filter((issue) => issue.id !== issueId || newStatus === "OPEN")
        );

        setCreatedByMeIssues((prev) =>
          prev.map((issue) =>
            issue.id === issueId ? { ...issue, status: newStatus } : issue
          )
        );

        // For completed issues tab - add to it if status is COMPLETED/REVIEW
        if (newStatus === "COMPLETED" || newStatus === "REVIEW") {
          const updatedIssue = allIssues.find((issue) => issue.id === issueId);
          if (
            updatedIssue &&
            (updatedIssue.created_by_id === user.id ||
              updatedIssue.assigned_to_id === user.id)
          ) {
            setCompletedIssues((prev) =>
              prev.find((i) => i.id === issueId)
                ? prev.map((i) =>
                    i.id === issueId ? { ...i, status: newStatus } : i
                  )
                : [...prev, { ...updatedIssue, status: newStatus }]
            );
          }
        } else {
          // Remove from completed issues if status is changed away from COMPLETED/REVIEW
          setCompletedIssues((prev) =>
            prev.filter((issue) => issue.id !== issueId)
          );
        }
      }

      toast({
        title: "Status Updated",
        description: `Issue status updated to ${newStatus.replace(/_/g, " ")}.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating issue status:", error);
    }
  };

  // Form handlers
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSelectChange = (name, value) => {
    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetCreateForm = () => {
    setCreateFormData({
      title: "",
      description: "",
      priority: "LOW",
      issue_type: "BUG",
      project_id: "",
    });
  };

  const resetAssignForm = () => {
    setAssignFormData({
      assigned_to_id: "",
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (createFormData.title.trim() && createFormData.project_id) {
      createIssue();
    }
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (assignFormData.assigned_to_id) {
      assignIssue();
    }
  };

  const openAssignDialog = (issue) => {
    setSelectedIssue(issue);
    setIsAssignDialogOpen(true);
  }; // Load data on component mount
  useEffect(() => {
    if (user) {
      // Fetch all issues first since fallback filters depend on it
      const loadData = async () => {
        // First fetch all issues
        await fetchAllIssues();

        // Then fetch other issue categories in parallel
        await Promise.all([fetchIssuesAssignedToMe(), fetchOpenIssues()]);

        // Then run the filters that depend on all issues
        await fetchCreatedByMeIssues();
        await fetchCompletedIssues();

        // Fetch supporting data
        fetchProjects();
        fetchUsers();
      };

      loadData();
    }
  }, [user]);

  // Helper function to refresh all data in the correct sequence
  const refreshAllData = async () => {
    await fetchAllIssues();
    await Promise.all([fetchIssuesAssignedToMe(), fetchOpenIssues()]);
    await fetchCreatedByMeIssues();
    await fetchCompletedIssues();
  };

  // Issue Card Component
  const IssueCard = ({ issue, showAssignButton = false }) => {
    const PriorityIcon = priorityConfig[issue.priority]?.icon || AlertCircle;

    // Determine if user can change status and allowed transitions
    const canChangeStatus =
      user &&
      (user.role === "PM" ||
        (issue.assigned_to_id === user.id && issue.status !== "OPEN"));

    const allowedStatuses = [];
    if (user?.role === "PM") {
      // PM can transition to any status except the current one
      Object.keys(statusConfig).forEach((statusKey) => {
        if (statusKey !== issue.status) {
          allowedStatuses.push(statusKey);
        }
      });
    } else if (user && issue.assigned_to_id === user.id) {
      // Non-PMs assigned to the issue, respecting transition rules and disallowing COMPLETED
      const validTransitions = {
        ASSIGNED: ["IN_PROGRESS"],
        IN_PROGRESS: ["REVIEW", "ASSIGNED"],
        REVIEW: ["IN_PROGRESS"],
      };
      if (validTransitions[issue.status]) {
        allowedStatuses.push(...validTransitions[issue.status]);
      }
    }

    const handleStatusChange = async (newStatus) => {
      // Check if the selected status is actually allowed (should be handled by UI, but good fallback)
      if (
        newStatus === issue.status ||
        (user?.role !== "PM" && newStatus === "COMPLETED")
      ) {
        return; // Prevent changing to current status or unauthorized transitions
      }
      await updateIssueStatus(issue.id, newStatus);
    };

    return (
      <Card className="hover:shadow-md transition-shadow flex flex-col justify-between">
        <CardHeader>
          <div className="text-xs flex items-center justify-between mb-2">
            {issue.project_title && (
              <div className="flex items-center gap-1">
                <Folder className="w-4 h-4" />
                <span>{issue.project_title}</span>
              </div>
            )}
            <div className="flex gap-2 flex-wrap justify-end">
              <Badge className={priorityConfig[issue.priority]?.color}>
                <PriorityIcon className="w-3 h-3 mr-1" />
                {issue.priority}
              </Badge>
              <Badge className={typeConfig[issue.issue_type]?.color}>
                {typeConfig[issue.issue_type]?.label}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col justify-between items-start">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {issue.title}
            </CardTitle>
            <CardDescription className="line-clamp-3">
              {issue.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              {canChangeStatus ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs">Change Status:</span>
                  <Select
                    value={issue.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="h-6 px-2 py-0 text-xs">
                      <SelectValue
                        placeholder="Change Status"
                        className="text-black"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedStatuses.map((statusKey) => (
                        <SelectItem key={statusKey} value={statusKey}>
                          {statusConfig[statusKey]?.label ||
                            statusKey.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Badge
                  variant="outline"
                  className={statusConfig[issue.status]?.color}
                >
                  {statusConfig[issue.status]?.label ||
                    issue.status?.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
            {showIssueStatus && (
              <div className="flex items-center gap-1">
                <span className="font-medium text-xs">Status:</span>
                <Badge
                  variant="outline"
                  className={statusConfig[issue.status]?.color}
                >
                  {statusConfig[issue.status]?.label ||
                    issue.status?.replace(/_/g, " ")}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-end">
          <div className="text-sm flex flex-col gap-1">
            {showAssignButton &&
              issue.status !== "COMPLETED" &&
              issue.status !== "REVIEW" && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAssignDialog(issue)}
                  >
                    Assign Issue
                  </Button>
                </div>
              )}
            {issue.assigned_to_id ? (
              <div className="text-sm flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{issue.assignee_name}</span>
              </div>
            ) : (
              <div className="text-sm flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Not Assigned</span>
              </div>
            )}
          </div>
          <div className="flex gap-1 flex-col items-end">
            {issue.created_by_id && (
              <div className="text-xs flex items-center gap-1">
                <span className="font-medium">Created by:</span>
                <span>{issue.creator_name || issue.created_by_id}</span>
              </div>
            )}
            {issue.created_at && (
              <div className="text-xs flex items-center gap-1">
                <span className="italic text-gray-500">
                  on {new Date(issue.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };
  const [filters, setFilters] = useState({
    status: "all_statuses",
    priority: "all_priorities",
    type: "all_types",
    assignedTo: "any_user",
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Add a filter function to filter issues based on selected criteria
  const filterIssues = (issues) => {
    return issues.filter((issue) => {
      // Apply status filter
      if (
        filters.status !== "all_statuses" &&
        issue.status !== filters.status
      ) {
        return false;
      }

      // Apply priority filter
      if (
        filters.priority !== "all_priorities" &&
        issue.priority !== filters.priority
      ) {
        return false;
      }

      // Apply type filter
      if (filters.type !== "all_types" && issue.issue_type !== filters.type) {
        return false;
      }

      // Apply assigned to filter
      if (
        filters.assignedTo !== "any_user" &&
        issue.assigned_to_id !== filters.assignedTo
      ) {
        return false;
      }

      return true;
    });
  };

  // Get filtered issues for each tab
  const filteredAllIssues = filterIssues(allIssues);
  const filteredMyIssues = filterIssues(myIssues);
  const filteredCreatedByMeIssues = filterIssues(createdByMeIssues);
  const filteredCompletedIssues = filterIssues(completedIssues);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: "all_statuses",
      priority: "all_priorities",
      type: "all_types",
      assignedTo: "any_user",
    });
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto flex flex-col space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-3xl font-bold text-black">Issues</h2>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Filter button with dropdown */}
            <div className="relative">
              {" "}
              <Button
                variant="outline"
                onClick={() => setIsFilterMenuOpen((prev) => !prev)}
                className="flex items-center gap-2"
              >
                <span>Filters</span>
                {(filters.status !== "all_statuses" ||
                  filters.priority !== "all_priorities" ||
                  filters.type !== "all_types" ||
                  filters.assignedTo !== "any_user") && (
                  <Badge variant="secondary" className="ml-1">
                    {
                      [
                        filters.status !== "all_statuses",
                        filters.priority !== "all_priorities",
                        filters.type !== "all_types",
                        filters.assignedTo !== "any_user",
                      ].filter(Boolean).length
                    }
                  </Badge>
                )}
              </Button>
              {isFilterMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-md border border-gray-200 p-4 z-50">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Filter Issues</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="h-7 text-xs"
                      >
                        Reset
                      </Button>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) =>
                          handleFilterChange("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>{" "}
                        <SelectContent>
                          <SelectItem value="all_statuses">
                            All Statuses
                          </SelectItem>
                          {Object.keys(statusConfig).map((status) => (
                            <SelectItem key={status} value={status}>
                              {statusConfig[status]?.label ||
                                status.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={filters.priority}
                        onValueChange={(value) =>
                          handleFilterChange("priority", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>{" "}
                        <SelectContent>
                          <SelectItem value="all_priorities">
                            All Priorities
                          </SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={filters.type}
                        onValueChange={(value) =>
                          handleFilterChange("type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>{" "}
                        <SelectContent>
                          <SelectItem value="all_types">All Types</SelectItem>
                          <SelectItem value="BUG">Bug</SelectItem>
                          <SelectItem value="FEATURE">Feature</SelectItem>
                          <SelectItem value="TASK">Task</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assigned To Filter */}
                    <div className="space-y-2">
                      <Label>Assigned To</Label>
                      <Select
                        value={filters.assignedTo}
                        onValueChange={(value) =>
                          handleFilterChange("assignedTo", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any User" />
                        </SelectTrigger>{" "}
                        <SelectContent>
                          <SelectItem value="any_user">Any User</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => setIsFilterMenuOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Create issue button */}
            {user && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>Create Issue</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Issue</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new issue.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title *
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          value={createFormData.title}
                          onChange={handleCreateInputChange}
                          className="col-span-3"
                          placeholder="Enter issue title"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label
                          htmlFor="description"
                          className="text-right mt-2"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={createFormData.description}
                          onChange={handleCreateInputChange}
                          className="col-span-3"
                          placeholder="Enter issue description"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Project *</Label>
                        <Select
                          value={createFormData.project_id}
                          onValueChange={(value) =>
                            handleCreateSelectChange("project_id", value)
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Priority</Label>
                        <Select
                          value={createFormData.priority}
                          onValueChange={(value) =>
                            handleCreateSelectChange("priority", value)
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Type</Label>
                        <Select
                          value={createFormData.issue_type}
                          onValueChange={(value) =>
                            handleCreateSelectChange("issue_type", value)
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BUG">Bug</SelectItem>
                            <SelectItem value="FEATURE">Feature</SelectItem>
                            <SelectItem value="TASK">Task</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreateDialogOpen(false);
                          resetCreateForm();
                        }}
                        disabled={isCreating}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          isCreating ||
                          !createFormData.title.trim() ||
                          !createFormData.project_id
                        }
                      >
                        {isCreating ? "Creating..." : "Create Issue"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>{" "}
        </div>
        {/* Display active filters - only when actual filters are applied */}
        {(filters.status !== "all_statuses" ||
          filters.priority !== "all_priorities" ||
          filters.type !== "all_types" ||
          filters.assignedTo !== "any_user") && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.status !== "all_statuses" && (
              <Badge variant="outline" className="flex items-center gap-1">
                {" "}
                Status: {statusConfig[filters.status]?.label || filters.status}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleFilterChange("status", "all_statuses")}
                >
                  ×
                </Button>
              </Badge>
            )}
            {filters.priority !== "all_priorities" && (
              <Badge variant="outline" className="flex items-center gap-1">
                {" "}
                Priority: {filters.priority}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() =>
                    handleFilterChange("priority", "all_priorities")
                  }
                >
                  ×
                </Button>
              </Badge>
            )}
            {filters.type !== "all_types" && (
              <Badge variant="outline" className="flex items-center gap-1">
                {" "}
                Type: {typeConfig[filters.type]?.label || filters.type}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleFilterChange("type", "all_types")}
                >
                  ×
                </Button>
              </Badge>
            )}
            {filters.assignedTo !== "any_user" && (
              <Badge variant="outline" className="flex items-center gap-1">
                {" "}
                Assigned to:{" "}
                {users.find((u) => u.id === filters.assignedTo)?.username ||
                  "User"}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleFilterChange("assignedTo", "any_user")}
                >
                  ×
                </Button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={resetFilters}
            >
              Clear all
            </Button>
          </div>
        )}
        {/* Assign Issue Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Assign Issue</DialogTitle>
              <DialogDescription>
                Assign "{selectedIssue?.title}" to a user.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignSubmit}>
              {" "}
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Assign To *</Label>
                  <Select
                    value={assignFormData.assigned_to_id}
                    onValueChange={(value) =>
                      setAssignFormData({ assigned_to_id: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.username} ({user.role}:{" "}
                          {user.id.substring(0, 5)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAssignDialogOpen(false);
                    setSelectedIssue(null);
                    resetAssignForm();
                  }}
                  disabled={isAssigning}
                >
                  Cancel
                </Button>{" "}
                <Button
                  type="submit"
                  disabled={isAssigning || !assignFormData.assigned_to_id}
                >
                  {isAssigning ? "Assigning..." : "Assign Issue"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>{" "}
        {/* Issues Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All Issues ({filteredAllIssues.length})
            </TabsTrigger>
            {user?.role === "PM" && (
              <TabsTrigger value="assigned">
                Assigned to Me ({filteredMyIssues.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="created">
              Created by Me ({filteredCreatedByMeIssues.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {user?.role === "PM" ? "Completed Issues" : "Review & Completed"}{" "}
              ({filteredCompletedIssues.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAllIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  showAssignButton={user?.role === "PM"}
                />
              ))}
            </div>
            {filteredAllIssues.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {allIssues.length === 0
                  ? "No issues found. Create your first issue!"
                  : "No issues match the selected filters."}
              </div>
            )}
          </TabsContent>
          <TabsContent value="assigned" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMyIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
            {filteredMyIssues.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {myIssues.length === 0
                  ? "No issues assigned to you yet."
                  : "No assigned issues match the selected filters."}
              </div>
            )}
          </TabsContent>
          <TabsContent value="created" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCreatedByMeIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  showAssignButton={user?.role === "PM"}
                />
              ))}
            </div>
            {filteredCreatedByMeIssues.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {createdByMeIssues.length === 0
                  ? "No issues created by you yet."
                  : "No created issues match the selected filters."}
              </div>
            )}
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompletedIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  showAssignButton={false}
                />
              ))}
            </div>
            {filteredCompletedIssues.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {completedIssues.length === 0
                  ? "No completed issues found."
                  : "No completed issues match the selected filters."}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default Issues;
