export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user_1",
};

export const ISSUE_STATUS = {
  ASSIGNED: "assigned",
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  CLOSED: "closed",
};

export const ISSUE_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export const KANBAN_COLUMNS = [
  { id: "Assigned", title: "Assigned", color: "bg-gray-100" },
  { id: "In Progress", title: "In Progress", color: "bg-blue-100" },
  { id: "Review", title: "Review", color: "bg-yellow-100" },
  { id: "Completed", title: "Completed", color: "bg-green-100" },
];
