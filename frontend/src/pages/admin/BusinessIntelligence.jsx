import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const emptyBI = {
  top_hiring_companies: [],
  most_applied_jobs: [],
  revenue_analytics: {
    total_revenue: 0,
    monthly_revenue: [],
  },
  monthly_growth_reports: {
    users: [],
    jobs: [],
    applications: [],
  },
  platform_performance_metrics: {
    total_users: 0,
    total_jobs: 0,
    active_jobs: 0,
    total_applications: 0,
    total_companies: 0,
    total_recruiters: 0,
    offered_count: 0,
    shortlisted_count: 0,
    average_time_to_hire_days: 0,
    conversion_rate: 0,
    shortlist_rate: 0,
  },
};

export default function BusinessIntelligence() {
  const [data, setData] = useState(emptyBI);
  const [loading, setLoading] = useState(true);

  const metrics = data.platform_performance_metrics || emptyBI.platform_performance_metrics;
  const revenue = data.revenue_analytics || emptyBI.revenue_analytics;
  const growth = data.monthly_growth_reports || emptyBI.monthly_growth_reports;

  const totalRevenue = Number(revenue.total_revenue || 0);

  const summaryCards = useMemo(() => {
    return [
      {
        label: 'Total Users',
        value: metrics.total_users,
        sub: 'Registered accounts',
        icon: '👥',
      },
      {
        label: 'Total Jobs',
        value: metrics.total_jobs,
        sub: `${metrics.active_jobs || 0} active jobs`,
        icon: '💼',
      },
      {
        label: 'Applications',
        value: metrics.total_applications,
        sub: `${metrics.offered_count || 0} offers`,
        icon: '📩',
      },
      {
        label: 'Revenue',
        value: formatCurrency(totalRevenue),
        sub: 'Completed payments',
        icon: '₹',
      },
    ];
  }, [metrics, totalRevenue]);

  const fetchBusinessIntelligence = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get('/analytics/business-intelligence');

      setData({
        ...emptyBI,
        ...res.data,
        revenue_analytics: {
          ...emptyBI.revenue_analytics,
          ...(res.data?.revenue_analytics || {}),
        },
        monthly_growth_reports: {
          ...emptyBI.monthly_growth_reports,
          ...(res.data?.monthly_growth_reports || {}),
        },
        platform_performance_metrics: {
          ...emptyBI.platform_performance_metrics,
          ...(res.data?.platform_performance_metrics || {}),
        },
      });
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        toast.error('Only admin can view Business Intelligence.');
      } else {
        toast.error(err.response?.data?.detail || 'Failed to load Business Intelligence data.');
      }

      setData(emptyBI);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinessIntelligence();
  }, [fetchBusinessIntelligence]);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="relative bg-slate-950 px-5 py-6 text-white sm:px-7">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-8 top-3 h-28 w-28 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Module 30
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Business Intelligence Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Track top hiring companies, most applied jobs, revenue, monthly growth, and platform performance.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchBusinessIntelligence}
                disabled={loading}
                className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card) => (
                <MetricCard key={card.label} card={card} />
              ))}
            </section>

            <section className="mt-5 grid gap-5 lg:grid-cols-2">
              <Panel
                title="Top Hiring Companies"
                description="Companies with the highest job posting activity"
              >
                <RankList
                  items={data.top_hiring_companies}
                  labelKey="company"
                  valueKey="jobs"
                  valueLabel="jobs"
                  emptyText="No company hiring data found."
                />
              </Panel>

              <Panel
                title="Most Applied Jobs"
                description="Jobs receiving the highest candidate interest"
              >
                <RankList
                  items={data.most_applied_jobs}
                  labelKey="title"
                  valueKey="applications"
                  valueLabel="applications"
                  emptyText="No application data found."
                />
              </Panel>
            </section>

            <section className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <Panel
                title="Revenue Analytics"
                description="Completed payment revenue by month"
              >
                <div className="rounded-3xl bg-linear-to-br from-emerald-50 to-cyan-50 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                    Total Revenue
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Calculated from completed payments
                  </p>
                </div>

                <div className="mt-4">
                  <BarList
                    items={revenue.monthly_revenue}
                    labelKey="month"
                    valueKey="revenue"
                    formatValue={formatCurrency}
                    emptyText="No monthly revenue data found."
                  />
                </div>
              </Panel>

              <Panel
                title="Monthly Growth Reports"
                description="Users, jobs, and applications growth"
              >
                <GrowthTable
                  users={growth.users}
                  jobs={growth.jobs}
                  applications={growth.applications}
                />
              </Panel>
            </section>

            <section className="mt-5">
              <Panel
                title="Platform Performance Metrics"
                description="Core platform health and hiring performance indicators"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MiniMetric label="Companies" value={metrics.total_companies} />
                  <MiniMetric label="Recruiters" value={metrics.total_recruiters} />
                  <MiniMetric label="Avg Time to Hire" value={`${metrics.average_time_to_hire_days || 0} days`} />
                  <MiniMetric label="Conversion Rate" value={`${metrics.conversion_rate || 0}%`} />
                  <MiniMetric label="Shortlist Rate" value={`${metrics.shortlist_rate || 0}%`} />
                  <MiniMetric label="Shortlisted" value={metrics.shortlisted_count} />
                  <MiniMetric label="Offered" value={metrics.offered_count} />
                  <MiniMetric label="Active Jobs" value={metrics.active_jobs} />
                </div>
              </Panel>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function MetricCard({ card }) {
  return (
    <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            {card.label}
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {card.value}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {card.sub}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-indigo-50 text-xl font-black text-indigo-700">
          {card.icon}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, description, children }) {
  return (
    <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <div className="mb-5">
        <h2 className="text-lg font-black text-slate-950">
          {title}
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function RankList({ items, labelKey, valueKey, valueLabel, emptyText }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <EmptyState text={emptyText} />;
  }

  const maxValue = Math.max(...items.map((item) => Number(item[valueKey] || 0)), 1);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const value = Number(item[valueKey] || 0);
        const width = Math.max((value / maxValue) * 100, 6);

        return (
          <div key={`${item[labelKey]}-${index}`} className="rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-900">
                  #{index + 1} {item[labelKey] || 'N/A'}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {value} {valueLabel}
                </p>
              </div>

              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">
                {value}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-linear-to-r from-indigo-600 to-cyan-500"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BarList({ items, labelKey, valueKey, formatValue, emptyText }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <EmptyState text={emptyText} />;
  }

  const maxValue = Math.max(...items.map((item) => Number(item[valueKey] || 0)), 1);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const value = Number(item[valueKey] || 0);
        const width = Math.max((value / maxValue) * 100, 6);

        return (
          <div key={`${item[labelKey]}-${index}`}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-xs font-black text-slate-600">
                {item[labelKey]}
              </span>
              <span className="text-xs font-black text-slate-900">
                {formatValue(value)}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-500 to-cyan-500"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GrowthTable({ users, jobs, applications }) {
  const months = Array.from(
    new Set([
      ...(users || []).map((item) => item.month),
      ...(jobs || []).map((item) => item.month),
      ...(applications || []).map((item) => item.month),
    ])
  ).sort();

  if (months.length === 0) {
    return <EmptyState text="No monthly growth data found." />;
  }

  const getCount = (list, month) => {
    const found = (list || []).find((item) => item.month === month);
    return Number(found?.count || 0);
  };

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            <TableHead>Month</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Jobs</TableHead>
            <TableHead>Applications</TableHead>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {months.map((month) => (
            <tr key={month} className="hover:bg-slate-50">
              <TableCell>{month}</TableCell>
              <TableCell>{getCount(users, month)}</TableCell>
              <TableCell>{getCount(jobs, month)}</TableCell>
              <TableCell>{getCount(applications, month)}</TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-slate-950">
        {value ?? 0}
      </p>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500">
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return (
    <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-slate-700">
      {children}
    </td>
  );
}

function LoadingState() {
  return (
    <div className="mt-5 rounded-4xl border border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-200/60">
      <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
      <p className="mt-4 text-sm font-black text-slate-700">
        Loading Business Intelligence Dashboard...
      </p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-8 text-center">
      <p className="text-sm font-black text-slate-700">
        {text}
      </p>
    </div>
  );
}

/* ================= HELPERS ================= */

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}

/* ================= ICONS ================= */

function SpinnerIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
    </svg>
  );
}