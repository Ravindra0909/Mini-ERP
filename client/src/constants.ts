import { RiskLevel, UserRole } from './types';
import type { Invoice, Project, Transaction, User, AuditLog } from './types';

// Mock Users
export const MOCK_USERS: User[] = [
  { id: 1, name: 'Alice Carter', email: 'alice@buildsmart.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/100/100?random=1' },
  { id: 2, name: 'Bob Finance', email: 'bob@buildsmart.com', role: UserRole.FINANCE_MANAGER, avatar: 'https://picsum.photos/100/100?random=2' },
  { id: 3, name: 'Charlie Site', email: 'charlie@buildsmart.com', role: UserRole.PROJECT_MANAGER, avatar: 'https://picsum.photos/100/100?random=3' },
];

// Mock Projects
export const MOCK_PROJECTS: Project[] = [
  {
    id: 101,
    name: 'Skyline Tower Phase 1',
    budget: 1500000,
    spent: 1200000,
    progress: 60, // Spent 80% but progress 60% -> High Risk
    status: 'Active',
    riskScore: 0, // Calculated at runtime
    riskLevel: RiskLevel.LOW, // Calculated at runtime
    startDate: '2023-01-15',
    endDate: '2024-06-30'
  },
  {
    id: 102,
    name: 'Riverfront Bridge',
    budget: 5000000,
    spent: 1000000,
    progress: 25, // On track
    status: 'Active',
    riskScore: 0,
    riskLevel: RiskLevel.LOW,
    startDate: '2023-05-01',
    endDate: '2025-12-01'
  },
  {
    id: 103,
    name: 'Westside Mall Renovation',
    budget: 750000,
    spent: 740000,
    progress: 85, // Nearly over budget
    status: 'Active',
    riskScore: 0,
    riskLevel: RiskLevel.LOW,
    startDate: '2023-08-10',
    endDate: '2024-02-28'
  }
];

// Mock Invoices
export const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', vendor: 'Steel Supplies Co.', amount: 45000, dueDate: '2023-10-25', status: 'Overdue', projectId: 101 },
  { id: 'INV-002', vendor: 'Concrete Mixers Ltd', amount: 12000, dueDate: '2023-11-05', status: 'Pending', projectId: 102 },
  { id: 'INV-003', vendor: 'Safety Gear Inc.', amount: 3500, dueDate: '2023-10-15', status: 'Paid', projectId: 103 },
  { id: 'INV-004', vendor: 'Heavy Machinery Rentals', amount: 25000, dueDate: '2023-11-10', status: 'Pending', projectId: 101 },
];

// Mock Transactions (GL)
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TRX-991', date: '2023-10-20', description: 'Project Payment - Skyline', amount: 50000, type: 'Credit', category: 'Revenue' },
  { id: 'TRX-992', date: '2023-10-21', description: 'Vendor Payout - Steel', amount: 45000, type: 'Debit', category: 'COGS' },
  { id: 'TRX-993', date: '2023-10-22', description: 'Office Rent', amount: 2000, type: 'Debit', category: 'OpEx' },
];

// Mock Logs
export const MOCK_LOGS: AuditLog[] = [
  { id: 1, user: 'Alice Carter', action: 'Approved Invoice INV-003', timestamp: '2023-10-15 14:30' },
  { id: 2, user: 'Bob Finance', action: 'Updated Budget for Project 101', timestamp: '2023-10-16 09:15' },
];