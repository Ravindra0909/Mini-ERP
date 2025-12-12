// Replaced Enums with const objects + types to satisfy erasableSyntaxOnly

export const UserRole = {
  ADMIN: 'Admin',
  FINANCE_MANAGER: 'Finance Manager',
  PROJECT_MANAGER: 'Project Manager',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export const RiskLevel = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
} as const;

export type RiskLevel = typeof RiskLevel[keyof typeof RiskLevel];

export interface Project {
  id: number;
  name: string;
  budget: number;
  spent: number;
  progress: number; // 0-100
  status: 'Active' | 'Completed' | 'On Hold';
  riskScore: number;
  riskLevel: RiskLevel;
  startDate: string;
  endDate: string;
}

export interface Invoice {
  id: string;
  vendor: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  projectId: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  category: string;
}

export interface AuditLog {
  id: number;
  user: string;
  action: string;
  timestamp: string;
}