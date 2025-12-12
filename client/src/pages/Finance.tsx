import React, { useEffect, useState } from 'react';
import { getInvoices, getTransactions, createInvoice } from '../services/api';
import type { Invoice, Transaction } from '../types';
import { FileText, Plus, CheckCircle, Clock, AlertCircle, X, Loader2 } from 'lucide-react';

export const FinanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'gl'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    vendor: '',
    amount: '',
    dueDate: '',
    projectId: ''
  });

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const [inv, trx] = await Promise.all([getInvoices(), getTransactions()]);
        setInvoices(inv);
        setTransactions(trx);
      } catch (e) {
        console.error("Error fetching finance data", e);
      }
    };
    fetchFinance();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await createInvoice({
        vendor: newInvoice.vendor,
        amount: parseFloat(newInvoice.amount),
        dueDate: newInvoice.dueDate,
        projectId: parseInt(newInvoice.projectId) || 0
      });
      // Update list and close modal
      setInvoices([...invoices, created]);
      setIsModalOpen(false);
      setNewInvoice({ vendor: '', amount: '', dueDate: '', projectId: '' });
    } catch (error) {
      alert("Failed to create invoice. Ensure server is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle size={16} className="text-green-500" />;
      case 'Pending': return <Clock size={16} className="text-yellow-500" />;
      case 'Overdue': return <AlertCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Finance Module</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>New Entry</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'invoices' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Accounts Payable (Invoices)
        </button>
        <button
          onClick={() => setActiveTab('gl')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'gl' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          General Ledger
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Project ID</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      {inv.id}
                    </td>
                    <td className="px-6 py-4">{inv.vendor}</td>
                    <td className="px-6 py-4 text-slate-500">#{inv.projectId}</td>
                    <td className="px-6 py-4">{inv.dueDate}</td>
                    <td className="px-6 py-4 font-mono font-medium">${inv.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(inv.status)}
                        <span className={`
                          ${inv.status === 'Paid' ? 'text-green-700' : ''}
                          ${inv.status === 'Pending' ? 'text-yellow-700' : ''}
                          ${inv.status === 'Overdue' ? 'text-red-700' : ''}
                        `}>{inv.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No invoices found. Click "New Entry" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'gl' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Ref ID</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Debit</th>
                  <th className="px-6 py-4 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{t.date}</td>
                    <td className="px-6 py-4 font-mono text-xs">{t.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{t.description}</td>
                    <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{t.category}</span></td>
                    <td className="px-6 py-4 text-right text-red-600 font-mono">
                      {t.type === 'Debit' ? `$${t.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-green-600 font-mono">
                      {t.type === 'Credit' ? `$${t.amount.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">New Invoice Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Vendor Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newInvoice.vendor}
                  onChange={e => setNewInvoice({...newInvoice, vendor: e.target.value})}
                  placeholder="e.g. Steel Works Inc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Amount ($)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newInvoice.amount}
                    onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newInvoice.dueDate}
                    onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Project ID</label>
                <input 
                  required
                  type="number" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newInvoice.projectId}
                  onChange={e => setNewInvoice({...newInvoice, projectId: e.target.value})}
                  placeholder="e.g. 101"
                />
              </div>
              
              <div className="pt-2 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Save Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};