import React, { useEffect, useState } from 'react';
import { 
   XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Activity, Sparkles, Loader2 } from 'lucide-react';

import type { Project } from '../types';
import { getProjects, getCashFlowForecast } from '../services/api';
import { generateExecutiveSummary } from '../services/geminiService';

export const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [cashFlow, setCashFlow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projData, flowData] = await Promise.all([
          getProjects(),
          getCashFlowForecast()
        ]);
        setProjects(projData);
        setCashFlow(flowData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerateInsight = async () => {
    setGeneratingAi(true);
    const summary = await generateExecutiveSummary(projects);
    setAiSummary(summary);
    setGeneratingAi(false);
  };

  const highRiskCount = projects.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical').length;
  const totalBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);
  const totalSpent = projects.reduce((acc, curr) => acc + curr.spent, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Executive Dashboard</h1>
        <button 
          onClick={handleGenerateInsight}
          disabled={generatingAi}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {generatingAi ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          <span>Ask AI Advisor</span>
        </button>
      </div>

      {/* AI Insight Box */}
      {aiSummary && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={100} />
          </div>
          <h3 className="text-indigo-900 font-semibold mb-2 flex items-center">
            <Sparkles size={16} className="mr-2" />
            Gemini Analysis
          </h3>
          <p className="text-indigo-800 whitespace-pre-line leading-relaxed text-sm">
            {aiSummary}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Budget</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">${(totalBudget / 1000000).toFixed(1)}M</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Spent</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">${(totalSpent / 1000000).toFixed(1)}M</h3>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <Activity size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Active Projects</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{projects.length}</h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-sm border ${highRiskCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`${highRiskCount > 0 ? 'text-red-600' : 'text-slate-500'} text-sm font-medium`}>Projects at Risk</p>
              <h3 className={`text-2xl font-bold mt-1 ${highRiskCount > 0 ? 'text-red-700' : 'text-slate-800'}`}>{highRiskCount}</h3>
            </div>
            <div className={`p-2 rounded-lg ${highRiskCount > 0 ? 'bg-red-200 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Cash Flow Forecast (6 Months)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
                />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={3} name="Actual Cash Flow" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="projected" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" name="Projected" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Alerts Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Project Risk Watchlist</h3>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-700 text-sm">{project.name}</h4>
                  <div className="flex items-center mt-1 space-x-2 text-xs text-slate-500">
                    <span>Bud: ${(project.budget/1000).toFixed(0)}k</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>Spent: {((project.spent/project.budget)*100).toFixed(0)}%</span>
                  </div>
                  {/* Progress Bar comparison */}
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <div className="mt-1 w-full flex justify-between text-[10px] text-slate-400">
                    <span>Progress: {project.progress}%</span>
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col items-end">
                   <span className={`px-2 py-1 rounded text-xs font-semibold ${
                     project.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                     project.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                     project.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                     'bg-green-100 text-green-700'
                   }`}>
                     {project.riskLevel} Risk
                   </span>
                   <span className="text-xs text-slate-400 mt-1">Score: {project.riskScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};