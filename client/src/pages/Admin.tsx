import React, { useEffect, useState } from 'react';
import { getAuditLogs, getUsers } from '../services/api';
import type { AuditLog, User } from '../types';
import { Shield, User as UserIcon } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, l] = await Promise.all([getUsers(), getAuditLogs()]);
        setUsers(u);
        setLogs(l);
      } catch (e) {
        console.error("Error fetching admin data", e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">System Administration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-4 text-slate-800">
            <UserIcon size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold">User Management</h2>
          </div>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center space-x-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800">{user.name}</h4>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{user.role}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-medium">
            + Add New User
          </button>
        </div>

        {/* Audit Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-4 text-slate-800">
            <Shield size={20} className="text-emerald-500" />
            <h2 className="text-lg font-semibold">System Audit Logs</h2>
          </div>
          <div className="space-y-0 divide-y divide-slate-100">
            {logs.map(log => (
              <div key={log.id} className="py-3">
                <p className="text-sm font-medium text-slate-800">{log.action}</p>
                <div className="flex justify-between mt-1 text-xs text-slate-500">
                  <span>{log.user}</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
             <div className="py-3 text-center text-sm text-slate-400 italic">
               End of recent logs
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};