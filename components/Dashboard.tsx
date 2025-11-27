import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TestResult, RiskLevel, TestStats, Language } from '../types';
import { translations } from '../translations';
import { Activity, AlertTriangle, Shield } from 'lucide-react';

interface Props {
  results: TestResult[];
  stats: TestStats;
  lang: Language;
}

const COLORS = {
  [RiskLevel.CRITICAL]: '#e11d48', // Red
  [RiskLevel.HIGH]: '#f97316', // Orange
  [RiskLevel.MEDIUM]: '#eab308', // Yellow
  [RiskLevel.LOW]: '#3b82f6', // Blue
  [RiskLevel.SAFE]: '#10b981', // Emerald
};

const Dashboard: React.FC<Props> = ({ results, stats, lang }) => {
  const t = translations[lang];

  const riskData = [
    { name: t.statusCritical, value: stats.criticalCount, color: COLORS.CRITICAL },
    { name: t.statusHigh, value: stats.highCount, color: COLORS.HIGH },
    { name: t.statusSafe, value: stats.completed - (stats.criticalCount + stats.highCount), color: COLORS.SAFE },
  ].filter(d => d.value > 0);

  const typeDataMap = results.reduce((acc, curr) => {
    const label = curr.attackType; // Use raw code, map to translation in render if needed, or simple string
    if (!acc[label]) acc[label] = { name: label, blocked: 0, bypassed: 0 };
    if (curr.success) acc[label].bypassed++;
    else acc[label].blocked++;
    return acc;
  }, {} as Record<string, any>);
  const typeData = Object.values(typeDataMap);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
            <Activity className="w-4 h-4" /> {t.totalTests}
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <Shield className="w-4 h-4" /> {t.blocked}
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">{stats.completed - stats.successCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <AlertTriangle className="w-4 h-4" /> {t.vulnerable}
          </div>
          <div className="text-3xl font-bold text-rose-500">{stats.successCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <AlertTriangle className="w-4 h-4" /> {t.critical}
          </div>
          <div className="text-3xl font-bold text-rose-600">{stats.criticalCount}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-80 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{t.riskDist}</h3>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">{t.noData}</div>
          )}
        </div>

        {/* Attack Vector Performance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-80 transition-colors">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{t.attackAnalysis}</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Legend />
                <Bar dataKey="blocked" stackId="a" fill="#10b981" name={t.blocked} radius={[0, 4, 4, 0]} />
                <Bar dataKey="bypassed" stackId="a" fill="#e11d48" name={t.vulnerable} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-slate-400">{t.noData}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;