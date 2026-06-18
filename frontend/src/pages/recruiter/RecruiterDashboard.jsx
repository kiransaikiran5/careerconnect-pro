import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function RecruiterDashboard() {
  const [stats, setStats] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async (showToast = false) => {
    try {
      setError('');

      if (showToast) {
        setRefreshLoading(true);
      } else {
        setPageLoading(true);
      }

      const res = await api.get('/recruiters/dashboard');
      setStats(res.data);

      if (showToast) {
        toast.success('Dashboard refreshed successfully.');
      }
    } catch (err) {
      const message =
        err.response?.data?.detail || 'Failed to load dashboard stats.';

      setError(message);
      toast.error(message);
    } finally {
      setPageLoading(false);
      setRefreshLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const dashboardStats = useMemo(() => {
    const totalJobs = Number(stats?.total_jobs_posted || 0);
    const totalApplications = Number(stats?.total_applications_received || 0);
    const totalShortlisted = Number(stats?.total_shortlisted || 0);
    const totalInterviews = Number(stats?.total_interviews_scheduled || 0);

    return [
      {
        label: 'Jobs Posted',
        value: totalJobs,
        helper: 'Total jobs created',
        icon: <BriefcaseIcon className="h-6 w-6" />,
        bg: 'from-indigo-600 to-cyan-500',
        softBg: 'bg-indigo-50',
        text: 'text-indigo-700',
      },
      {
        label: 'Applications',
        value: totalApplications,
        helper: 'Candidates applied',
        icon: <ApplicationIcon className="h-6 w-6" />,
        bg: 'from-emerald-600 to-teal-500',
        softBg: 'bg-emerald-50',
        text: 'text-emerald-700',
      },
      {
        label: 'Shortlisted',
        value: totalShortlisted,
        helper: 'Selected candidates',
        icon: <CheckCircleIcon className="h-6 w-6" />,
        bg: 'from-amber-500 to-orange-500',
        softBg: 'bg-amber-50',
        text: 'text-amber-700',
      },
      {
        label: 'Interviews',
        value: totalInterviews,
        helper: 'Scheduled rounds',
        icon: <CalendarIcon className="h-6 w-6" />,
        bg: 'from-purple-600 to-fuchsia-500',
        softBg: 'bg-purple-50',
        text: 'text-purple-700',
      },
    ];
  }, [stats]);

  const totalApplications = Number(stats?.total_applications_received || 0);
  const totalShortlisted = Number(stats?.total_shortlisted || 0);
  const totalInterviews = Number(stats?.total_interviews_scheduled || 0);

  const shortlistRate =
    totalApplications > 0
      ? Math.round((totalShortlisted / totalApplications) * 100)
      : 0;

  const interviewRate =
    totalApplications > 0
      ? Math.round((totalInterviews / totalApplications) * 100)
      : 0;

  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
            <div className="flex min-h-96 items-center justify-center">
              <div className="text-center">
                <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

                <h2 className="mt-4 text-xl font-black text-slate-950">
                  Loading Recruiter Dashboard
                </h2>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Preparing your hiring overview...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="w-full rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-200/70">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
              <WarningIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              Dashboard Not Loaded
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchStats()}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40"
            >
              Try Again
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="relative bg-slate-950 px-5 py-5 text-white sm:px-7">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-8 top-3 h-28 w-28 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Recruiter Analytics
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Recruiter Dashboard
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                  Track jobs, applications, shortlisted candidates, and scheduled interviews from one professional workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchStats(true)}
                disabled={refreshLoading}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {refreshLoading ? (
                  <>
                    <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                    Refreshing
                  </>
                ) : (
                  <>
                    <RefreshIcon className="mr-2 h-5 w-5" />
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {/* PERFORMANCE */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Performance
                </p>

                <h2 className="text-xl font-black text-slate-950">
                  Hiring Funnel Overview
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ChartIcon className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-5">
              <ProgressRow
                label="Shortlist Rate"
                value={shortlistRate}
                description={`${totalShortlisted} shortlisted from ${totalApplications} applications`}
              />

              <ProgressRow
                label="Interview Rate"
                value={interviewRate}
                description={`${totalInterviews} interviews scheduled from ${totalApplications} applications`}
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MiniInsight
                label="Applications"
                value={totalApplications}
                note="Total received"
              />

              <MiniInsight
                label="Shortlisted"
                value={totalShortlisted}
                note="Candidate pipeline"
              />

              <MiniInsight
                label="Interviews"
                value={totalInterviews}
                note="Scheduled rounds"
              />
            </div>
          </section>

          {/* QUICK SUMMARY */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
                <SparkIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                  Summary
                </p>

                <h2 className="text-xl font-black text-slate-950">
                  Today&apos;s Hiring Pulse
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              <SummaryCard
                icon={<BriefcaseIcon className="h-5 w-5" />}
                title="Jobs Posted"
                value={stats?.total_jobs_posted || 0}
              />

              <SummaryCard
                icon={<ApplicationIcon className="h-5 w-5" />}
                title="Applications Received"
                value={stats?.total_applications_received || 0}
              />

              <SummaryCard
                icon={<CheckCircleIcon className="h-5 w-5" />}
                title="Candidates Shortlisted"
                value={stats?.total_shortlisted || 0}
              />

              <SummaryCard
                icon={<CalendarIcon className="h-5 w-5" />}
                title="Interviews Scheduled"
                value={stats?.total_interviews_scheduled || 0}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ item }) {
  return (
    <article className="group overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/60">
      <div className={`h-1.5 bg-linear-to-r ${item.bg}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-500">
              {item.label}
            </p>

            <h3 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              {item.value}
            </h3>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              {item.helper}
            </p>
          </div>

          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.softBg} ${item.text}`}>
            {item.icon}
          </div>
        </div>
      </div>
    </article>
  );
}

function ProgressRow({ label, value, description }) {
  const safeValue = Math.min(Math.max(Number(value || 0), 0), 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-800">{label}</p>
          <p className="text-xs font-semibold text-slate-500">{description}</p>
        </div>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
          {safeValue}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-linear-to-r from-indigo-600 to-cyan-500 transition-all duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function MiniInsight({ label, value, note }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        {note}
      </p>
    </div>
  );
}

function SummaryCard({ icon, title, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
          {icon}
        </div>

        <p className="truncate text-sm font-black text-slate-700">
          {title}
        </p>
      </div>

      <p className="text-lg font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

/* ================= ICONS ================= */

function BriefcaseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h14" />
    </svg>
  );
}

function ApplicationIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7V3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M10 13h6M10 17h6" />
    </svg>
  );
}

function CheckCircleIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5 11 14.5 15.5 9.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function CalendarIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v3M17 3v3M4 8h16M5 5h14v16H5V5Z" />
    </svg>
  );
}

function ChartIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8" />
    </svg>
  );
}

function SparkIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  );
}

function RefreshIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8 8 0 0 0-14.9-4M4 5v5h5M4 13a8 8 0 0 0 14.9 4M20 19v-5h-5" />
    </svg>
  );
}

function WarningIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 4.3 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function SpinnerIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
    </svg>
  );
}