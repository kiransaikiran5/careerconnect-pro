import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const statCards = [
  {
    key: 'total_users',
    label: 'Total Users',
    icon: '👥',
    hint: 'All registered accounts',
    gradient: 'from-blue-50 to-indigo-50',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'total_recruiters',
    label: 'Recruiters',
    icon: '💼',
    hint: 'Hiring accounts',
    gradient: 'from-emerald-50 to-green-50',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'total_companies',
    label: 'Companies',
    icon: '🏢',
    hint: 'Company profiles',
    gradient: 'from-amber-50 to-yellow-50',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'total_jobs',
    label: 'Total Jobs',
    icon: '📋',
    hint: 'Jobs posted',
    gradient: 'from-purple-50 to-fuchsia-50',
    badgeClass: 'bg-purple-100 text-purple-700',
  },
];

const quickActions = [
  {
    title: 'Manage Recruiters',
    description: 'Verify and manage recruiter accounts.',
    path: '/admin/recruiters',
    icon: '🧑‍💼',
  },
  {
    title: 'Job Categories',
    description: 'Create and organize job categories.',
    path: '/admin/categories',
    icon: '🗂️',
  },
  {
    title: 'Manage Jobs',
    description: 'Review all jobs posted on platform.',
    path: '/manage-jobs',
    icon: '📋',
  },
  {
    title: 'Online Interviews',
    description: 'Monitor scheduled interview sessions.',
    path: '/online-interviews',
    icon: '🎥',
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get('/admin/dashboard');
      setStats(res.data || {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load admin dashboard.');
      setStats({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totalPlatformItems = useMemo(() => {
    return statCards.reduce((total, card) => {
      return total + Number(stats?.[card.key] || 0);
    }, 0);
  }, [stats]);

  const handleRefresh = async () => {
    await fetchStats();
    toast.success('Admin dashboard refreshed.');
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 px-6 py-7 text-white sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-indigo-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Admin Control Center
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Admin Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                  Monitor users, recruiters, companies, jobs, and platform activity from one clean workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
                  <p className="text-xs font-bold text-slate-300">
                    Platform Count
                  </p>

                  <p className="mt-1 text-3xl font-black text-white">
                    {loading ? '...' : totalPlatformItems}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="rounded-3xl bg-white px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <StatsSkeleton />
            ) : (
              statCards.map((card) => (
                <StatCard
                  key={card.key}
                  card={card}
                  value={Number(stats?.[card.key] || 0)}
                />
              ))
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
          {/* Quick Actions */}
          <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Admin Tools
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Quick Actions
                </h2>
              </div>

              <p className="text-sm font-semibold text-slate-500">
                Fast access to important controls
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/80"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-white text-2xl shadow-sm ring-1 ring-slate-200 group-hover:ring-indigo-200">
                      {action.icon}
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-950">
                        {action.title}
                      </h3>

                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                        {action.description}
                      </p>

                      <p className="mt-3 text-xs font-black uppercase tracking-widest text-indigo-600">
                        Open
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Summary Panel */}
          <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Platform Summary
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Overview
            </h2>

            <div className="mt-6 space-y-3">
              {statCards.map((card) => (
                <SummaryItem
                  key={card.key}
                  icon={card.icon}
                  label={card.label}
                  value={Number(stats?.[card.key] || 0)}
                  loading={loading}
                />
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-linear-to-br from-indigo-50 to-cyan-50 p-4 ring-1 ring-indigo-100">
              <h3 className="text-sm font-black text-slate-950">
                Admin Note
              </h3>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Keep recruiter verification, job categories, and posted jobs updated regularly for a cleaner hiring experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ card, value }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-linear-to-br ${card.gradient} p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/80`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white text-2xl shadow-sm">
          {card.icon}
        </div>

        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${card.badgeClass}`}>
          Live
        </span>
      </div>

      <p className="mt-5 text-3xl font-black text-slate-950">
        {value}
      </p>

      <h3 className="mt-1 text-sm font-black text-slate-700">
        {card.label}
      </h3>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        {card.hint}
      </p>
    </div>
  );
}

function SummaryItem({ icon, label, value, loading }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
          {icon}
        </div>

        <p className="text-sm font-black text-slate-700">
          {label}
        </p>
      </div>

      <p className="text-lg font-black text-slate-950">
        {loading ? '...' : value}
      </p>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="h-12 w-12 animate-pulse rounded-3xl bg-slate-200" />
          <div className="mt-5 h-8 w-20 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </>
  );
}