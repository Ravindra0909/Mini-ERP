import type { Invoice, Project, Transaction, User, AuditLog } from '../types';

// In production, we use a relative path because the backend serves the frontend.
// In development, we use the full localhost URL.
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

// Helper to get headers with JWT
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// --- Auth ---
export const login = async (email: string, password: string = 'password'): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.warn("Login failed with status:", response.status);
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

// --- Projects ---
export const getProjects = async (): Promise<Project[]> => {
  const response = await fetch(`${API_URL}/projects`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

// --- Finance ---
export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await fetch(`${API_URL}/finance/invoices`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch invoices');
  return response.json();
};

export const createInvoice = async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
  const response = await fetch(`${API_URL}/finance/invoices`, { 
    method: 'POST', 
    headers: getHeaders(),
    body: JSON.stringify(invoiceData)
  });
  if (!response.ok) throw new Error('Failed to create invoice');
  return response.json();
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(`${API_URL}/finance/transactions`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
};

export const getCashFlowForecast = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/dashboard/cashflow`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch forecast');
  return response.json();
};

// --- Admin ---
export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/admin/users`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await fetch(`${API_URL}/admin/logs`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch logs');
  return response.json();
};