import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const statusCards = [
  {
    key: 'applied',
    apiStatus: 'APPLIED',
    label: 'Applied',
    icon: '📄',
    cardClass: 'border-blue-100 bg-blue-50 text-blue-700',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'shortlisted',
    apiStatus: 'SHORTLISTED',
    label: 'Shortlisted',
    icon: '⭐',
    cardClass: 'border-amber-100 bg-amber-50 text-amber-700',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'rejected',
    apiStatus: 'REJECTED',
    label: 'Rejected',
    icon: '❌',
    cardClass: 'border-red-100 bg-red-50 text-red-700',
    badgeClass: 'bg-red-100 text-red-700',
  },
  {
    key: 'interview_scheduled',
    apiStatus: 'INTERVIEW_SCHEDULED',
    label: 'Interview',
    icon: '🗓️',
    cardClass: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'offered',
    apiStatus: 'OFFERED',
    label: 'Offered',
    icon: '🎉',
    cardClass: 'border-purple-100 bg-purple-50 text-purple-700',
    badgeClass: 'bg-purple-100 text-purple-700',
  },
];

export default function ApplicationDashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [statsLoading, setStatsLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  const total = Number(stats?.total_applications || stats?.total || 0);

  const activeStatus = useMemo(() => {
    return statusCards.find((item) => item.key === statusFilter);
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get('/applications/stats');
      setStats(res.data || {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load application stats.');
      setStats({});
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);

      const params = {};

      if (activeStatus?.apiStatus) {
        params.status = activeStatus.apiStatus;
      }

      const res = await api.get('/applications/my-applications', { params });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.applications)
            ? res.data.applications
            : [];

      setApplications(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load applications.');
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleRefresh = async () => {
    await Promise.all([fetchStats(), fetchApplications()]);
    toast.success('Application dashboard refreshed.');
  };

  const clearFilter = () => {
    setStatusFilter('');
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
                  Job Seeker Dashboard
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Application Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                  Track your job applications, interview progress, and hiring status in one clean workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
                  <p className="text-xs font-bold text-slate-300">
                    Total Applications
                  </p>

                  <p className="mt-1 text-3xl font-black text-white">
                    {statsLoading ? '...' : total}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="rounded-3xl bg-white px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-indigo-50"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
            {statusCards.map((card) => {
              const value = getStatValue(stats, card.key);
              const active = statusFilter === card.key;

              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setStatusFilter(active ? '' : card.key)}
                  className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                    active
                      ? 'border-indigo-300 bg-indigo-50 shadow-lg shadow-indigo-100'
                      : `${card.cardClass} hover:shadow-slate-200`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                      {card.icon}
                    </div>

                    {active && (
                      <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-3xl font-black text-slate-950">
                    {statsLoading ? '...' : value}
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-600">
                    {card.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Current View
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              {activeStatus ? `${activeStatus.label} Applications` : 'All Applications'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusCards.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => setStatusFilter(statusFilter === card.key ? '' : card.key)}
                className={`rounded-2xl px-3 py-2 text-xs font-black transition ${
                  statusFilter === card.key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                {card.label}
              </button>
            ))}

            {statusFilter && (
              <button
                type="button"
                onClick={clearFilter}
                className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Applications */}
        <div className="rounded-4xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50 sm:p-5">
          {applicationsLoading ? (
            <ApplicationSkeleton />
          ) : applications.length === 0 ? (
            <EmptyState activeStatus={activeStatus} />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function ApplicationCard({ app }) {
  const status = String(app.status || 'APPLIED').toUpperCase();
  const statusInfo = getStatusInfo(status);

  return (
    <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-white text-xl shadow-sm ring-1 ring-slate-200">
            {statusInfo.icon}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-slate-950">
              {app.job_title || app.job?.title || 'Untitled Job'}
            </h3>

            <p className="mt-1 text-sm font-semibold text-slate-600">
              {app.company_name || app.company || app.job?.company_name || 'Company not available'}
              {' '}
              <span className="text-slate-300">•</span>
              {' '}
              {app.location || app.job?.location || 'Location not available'}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
              <span>
                Applied on {formatDate(app.applied_at || app.created_at)}
              </span>

              {app.resume_title && (
                <>
                  <span>•</span>
                  <span>{app.resume_title}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1.5 text-xs font-black ${statusInfo.badgeClass}`}>
            {formatStatus(status)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ApplicationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-3xl bg-slate-200" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-80 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="h-8 w-28 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ activeStatus }) {
  return (
    <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm">
          🗂️
        </div>

        <h3 className="mt-4 text-xl font-black text-slate-950">
          No applications found
        </h3>

        <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
          {activeStatus
            ? `No ${activeStatus.label.toLowerCase()} applications are available right now. Try clearing the filter.`
            : 'Your applications will appear here after you apply for jobs.'}
        </p>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function getStatValue(stats, key) {
  if (!stats) return 0;

  return Number(
    stats[key] ||
      stats[String(key).toUpperCase()] ||
      stats[String(key).replaceAll('_', '').toLowerCase()] ||
      0
  );
}

function getStatusInfo(status) {
  const match = statusCards.find((item) => item.apiStatus === status);

  if (match) return match;

  return {
    icon: '📌',
    badgeClass: 'bg-slate-100 text-slate-700',
  };
}

function formatStatus(status) {
  return String(status || 'APPLIED')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return 'Date not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}