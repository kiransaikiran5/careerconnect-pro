import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const tabs = [
  {
    key: 'job-posting',
    label: 'Job Posting',
    icon: '📋',
    description: 'Job posting trends, categories, and top companies.',
  },
  {
    key: 'hiring',
    label: 'Hiring',
    icon: '🎯',
    description: 'Applications, recruitment funnel, and hiring speed.',
  },
  {
    key: 'candidate',
    label: 'Candidates',
    icon: '👥',
    description: 'Top jobs by applications and status distribution.',
  },
];

const statusColors = {
  APPLIED: 'bg-blue-500',
  SHORTLISTED: 'bg-amber-500',
  INTERVIEW_SCHEDULED: 'bg-emerald-500',
  OFFERED: 'bg-purple-500',
  REJECTED: 'bg-red-500',
};

export default function Analytics() {
  const [tab, setTab] = useState('job-posting');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const activeTab = useMemo(() => {
    return tabs.find((item) => item.key === tab) || tabs[0];
  }, [tab]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get(`/analytics/${tab}`);
      setData(res.data || {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load analytics.');
      setData({});
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    await fetchData();
    toast.success('Analytics refreshed.');
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
                  Reports Center
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Analytics & Reports
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                  View job posting performance, hiring progress, candidate activity, and recruitment insights.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="rounded-3xl bg-white px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Refreshing...' : 'Refresh Reports'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            {tabs.map((item) => {
              const active = tab === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                    active
                      ? 'border-indigo-300 bg-indigo-50 shadow-lg shadow-indigo-100'
                      : 'border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                      {item.icon}
                    </div>

                    <div>
                      <p
                        className={`text-sm font-black ${
                          active ? 'text-indigo-700' : 'text-slate-900'
                        }`}
                      >
                        {item.label}
                      </p>

                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Report */}
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            Current Report
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-950">
            {activeTab.icon} {activeTab.label} Analytics
          </h2>
        </div>

        {loading ? (
          <AnalyticsSkeleton />
        ) : (
          <>
            {tab === 'job-posting' && <JobPostingAnalytics data={data} />}
            {tab === 'hiring' && <HiringAnalytics data={data} />}
            {tab === 'candidate' && <CandidateAnalytics data={data} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ================= JOB POSTING ANALYTICS ================= */

function JobPostingAnalytics({ data }) {
  const monthly = safeArray(data.monthly);
  const byCategory = safeArray(data.by_category);
  const byCompany = safeArray(data.by_company);

  const totalJobsPosted = monthly.reduce(
    (total, item) => total + Number(item.count || 0),
    0
  );

  const totalCategories = byCategory.length;
  const totalCompanies = byCompany.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SmallStatCard icon="📈" label="Monthly Jobs" value={totalJobsPosted} />
        <SmallStatCard icon="🗂️" label="Categories" value={totalCategories} />
        <SmallStatCard icon="🏢" label="Companies" value={totalCompanies} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard
          title="Jobs Posted per Month"
          subtitle="Monthly job posting trend"
          icon="📈"
        >
          <BarList
            data={monthly}
            labelKey="month"
            valueKey="count"
            emptyText="No monthly job posting data available."
            barClass="bg-blue-500"
          />
        </ReportCard>

        <ReportCard
          title="Jobs by Category"
          subtitle="Category-wise job distribution"
          icon="🗂️"
        >
          <BarList
            data={byCategory}
            labelKey="category"
            valueKey="count"
            emptyText="No category data available."
            barClass="bg-emerald-500"
          />
        </ReportCard>
      </div>

      <ReportCard
        title="Top Companies by Job Postings"
        subtitle="Companies with the highest number of job posts"
        icon="🏢"
      >
        <SimpleTable
          data={byCompany}
          firstColumn="Company"
          secondColumn="Jobs"
          firstKey="company"
          secondKey="count"
          emptyText="No company analytics data available."
        />
      </ReportCard>
    </div>
  );
}

/* ================= HIRING ANALYTICS ================= */

function HiringAnalytics({ data }) {
  const monthlyApplications = safeArray(data.monthly_applications);
  const funnel = safeArray(data.funnel);
  const averageDays = Number(data.average_time_to_hire_days || 0);

  const totalApplications = monthlyApplications.reduce(
    (total, item) => total + Number(item.count || 0),
    0
  );

  const funnelTotal = funnel.reduce(
    (total, item) => total + Number(item.count || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SmallStatCard icon="📥" label="Applications" value={totalApplications} />
        <SmallStatCard icon="🎯" label="Funnel Count" value={funnelTotal} />
        <SmallStatCard
          icon="⏱️"
          label="Avg. Time to Hire"
          value={averageDays > 0 ? `${averageDays} days` : 'N/A'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard
          title="Applications per Month"
          subtitle="Monthly application activity"
          icon="📥"
        >
          <BarList
            data={monthlyApplications}
            labelKey="month"
            valueKey="count"
            emptyText="No monthly application data available."
            barClass="bg-indigo-500"
          />
        </ReportCard>

        <ReportCard
          title="Recruitment Funnel"
          subtitle="Hiring stage conversion overview"
          icon="🎯"
        >
          <BarList
            data={funnel}
            labelKey="stage"
            valueKey="count"
            emptyText="No recruitment funnel data available."
            barClass="bg-purple-500"
            labelFormatter={formatLabel}
          />

          {averageDays > 0 && (
            <div className="mt-5 rounded-3xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
              <p className="text-sm font-black text-slate-950">
                Average time to hire
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-600">
                Candidates are hired in approximately{' '}
                <span className="font-black text-indigo-700">
                  {averageDays} days
                </span>.
              </p>
            </div>
          )}
        </ReportCard>
      </div>
    </div>
  );
}

/* ================= CANDIDATE ANALYTICS ================= */

function CandidateAnalytics({ data }) {
  const topJobs = safeArray(data.top_jobs);
  const statusDistribution = safeArray(data.status_distribution);

  const totalApplications = topJobs.reduce(
    (total, item) => total + Number(item.applications || 0),
    0
  );

  const statusTotal = statusDistribution.reduce(
    (total, item) => total + Number(item.count || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SmallStatCard icon="🔥" label="Top Job Applications" value={totalApplications} />
        <SmallStatCard icon="📌" label="Status Records" value={statusTotal} />
        <SmallStatCard icon="🧾" label="Jobs Tracked" value={topJobs.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard
          title="Top Jobs by Applications"
          subtitle="Jobs receiving the highest candidate interest"
          icon="🔥"
        >
          <BarList
            data={topJobs}
            labelKey="title"
            valueKey="applications"
            emptyText="No top job analytics data available."
            barClass="bg-blue-500"
          />
        </ReportCard>

        <ReportCard
          title="Application Status Distribution"
          subtitle="Candidate application status overview"
          icon="📌"
        >
          {statusDistribution.length === 0 ? (
            <EmptyBlock text="No status distribution data available." />
          ) : (
            <div className="space-y-4">
              {statusDistribution.map((item) => {
                const status = String(item.status || 'UNKNOWN').toUpperCase();
                const value = Number(item.count || 0);
                const percent = statusTotal > 0 ? Math.round((value / statusTotal) * 100) : 0;

                return (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-black text-slate-700">
                        {formatLabel(status)}
                      </p>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                        {value}
                      </span>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          statusColors[status] || 'bg-slate-500'
                        }`}
                        style={{
                          width: `${percent}%`,
                          minWidth: value > 0 ? '2rem' : '0rem',
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {percent}% of applications
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </ReportCard>
      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function ReportCard({ title, subtitle, icon, children }) {
  return (
    <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-indigo-50 text-2xl ring-1 ring-indigo-100">
          {icon}
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-950">
            {title}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}

function SmallStatCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-xl ring-1 ring-indigo-100">
          {icon}
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">
          Live
        </span>
      </div>

      <p className="mt-4 text-3xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm font-black text-slate-600">
        {label}
      </p>
    </div>
  );
}

function BarList({
  data,
  labelKey,
  valueKey,
  emptyText,
  barClass,
  labelFormatter,
}) {
  const maxValue = getMaxValue(data, valueKey);

  if (data.length === 0) {
    return <EmptyBlock text={emptyText} />;
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const rawLabel = item[labelKey] ?? `Item ${index + 1}`;
        const label = labelFormatter ? labelFormatter(rawLabel) : rawLabel;
        const value = Number(item[valueKey] || 0);
        const percent = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;

        return (
          <div key={`${rawLabel}-${index}`}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-black text-slate-700">
                {label}
              </p>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                {value}
              </span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                style={{
                  width: `${percent}%`,
                  minWidth: value > 0 ? '2rem' : '0rem',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SimpleTable({
  data,
  firstColumn,
  secondColumn,
  firstKey,
  secondKey,
  emptyText,
}) {
  if (data.length === 0) {
    return <EmptyBlock text={emptyText} />;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-400">
                {firstColumn}
              </th>

              <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-400">
                {secondColumn}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {data.map((item, index) => (
              <tr key={`${item[firstKey]}-${index}`} className="hover:bg-slate-50">
                <td className="px-5 py-4 text-sm font-black text-slate-800">
                  {item[firstKey] || 'Not available'}
                </td>

                <td className="px-5 py-4 text-right text-sm font-black text-slate-600">
                  {Number(item[secondKey] || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyBlock({ text }) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-2xl shadow-sm">
          🗂️
        </div>

        <p className="mt-3 text-sm font-bold text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-3xl border border-slate-200 bg-white p-5"
          >
            <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-200" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="rounded-4xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-3xl bg-slate-200" />

              <div className="space-y-2">
                <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-60 animate-pulse rounded bg-slate-200" />
              </div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row}>
                  <div className="mb-2 flex justify-between">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-10 animate-pulse rounded bg-slate-200" />
                  </div>

                  <div className="h-4 animate-pulse rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getMaxValue(data, valueKey) {
  if (!Array.isArray(data) || data.length === 0) return 1;

  return Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);
}

function formatLabel(value) {
  return String(value || 'Not available')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}