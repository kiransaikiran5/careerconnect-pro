import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const statusOptions = [
  'ALL',
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'OFFERED',
  'REJECTED',
];

const statusStyles = {
  APPLIED: 'bg-blue-100 text-blue-700',
  SHORTLISTED: 'bg-amber-100 text-amber-700',
  INTERVIEW_SCHEDULED: 'bg-emerald-100 text-emerald-700',
  OFFERED: 'bg-purple-100 text-purple-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const fetchApplications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshLoading(true);
      } else {
        setPageLoading(true);
      }

      const res = await api.get('/applications/my-applications');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setApplications(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load applications.');
    } finally {
      setPageLoading(false);
      setRefreshLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'ALL') return applications;

    return applications.filter((app) => app.status === statusFilter);
  }, [applications, statusFilter]);

  const totalApplications = applications.length;
  const activeApplications = applications.filter(
    (app) => app.status !== 'REJECTED'
  ).length;
  const interviews = applications.filter(
    (app) => app.status === 'INTERVIEW_SCHEDULED'
  ).length;

  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-4xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
          <div className="flex min-h-96 items-center justify-center">
            <div className="text-center">
              <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

              <h2 className="mt-4 text-xl font-black text-slate-950">
                Loading Applications
              </h2>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                Fetching your application history...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="relative bg-slate-950 px-5 py-6 text-white sm:px-7">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-8 top-3 h-28 w-28 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Job Seeker Workspace
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  My Applications
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Track every job you applied for, check status updates, and continue your career hunt without losing the thread.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:min-w-96">
                <HeaderStat value={totalApplications} label="Total" />
                <HeaderStat value={activeApplications} label="Active" />
                <HeaderStat value={interviews} label="Interviews" />
              </div>
            </div>
          </div>
        </section>

        {/* TOOLBAR */}
        <section className="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                Application Tracker
              </p>

              <h2 className="text-xl font-black text-slate-950">
                Application History
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All Status' : formatStatus(status)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => fetchApplications(true)}
                disabled={refreshLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
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

              <Link
                to="/jobs"
                className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40"
              >
                Find Jobs
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* LIST */}
        <section className="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          {filteredApplications.length === 0 ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                  <ClipboardIcon className="h-8 w-8" />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  No applications found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {applications.length === 0
                    ? "You haven't applied to any jobs yet."
                    : 'No applications match this status filter.'}
                </p>

                <Link
                  to="/jobs"
                  className="mt-5 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function ApplicationCard({ application }) {
  const jobId = application.job_id || application.job?.id;
  const status = application.status || 'APPLIED';

  return (
    <article className="rounded-4xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <BriefcaseIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-slate-950">
                {application.job_title ||
                  application.job?.title ||
                  'Job Title N/A'}
              </h3>

              <StatusBadge status={status} />
            </div>

            <p className="mt-1 text-sm font-bold text-slate-600">
              {application.company_name ||
                application.job?.company?.name ||
                application.job?.company_name ||
                'Unknown Company'}{' '}
              • {application.location || application.job?.location || 'N/A'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
              <span className="rounded-full bg-white px-3 py-1">
                Applied: {formatDate(application.applied_at)}
              </span>

              {application.updated_at && (
                <span className="rounded-full bg-white px-3 py-1">
                  Updated: {formatDate(application.updated_at)}
                </span>
              )}

              {application.resume_title && (
                <span className="rounded-full bg-white px-3 py-1">
                  Resume: {application.resume_title}
                </span>
              )}
            </div>

            {application.cover_letter && (
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                {application.cover_letter}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          {jobId && (
            <Link
              to={`/jobs/${jobId}`}
              className="inline-flex items-center rounded-2xl bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
            >
              View Job
              <ArrowRightIcon className="ml-1.5 h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        statusStyles[status] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function HeaderStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur">
      <p className="text-xl font-black leading-none text-white">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* ================= HELPERS ================= */

function formatStatus(status) {
  if (!status) return 'Unknown';

  return String(status)
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(dateValue) {
  if (!dateValue) return 'Not available';

  return new Date(dateValue).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/* ================= ICONS ================= */

function BriefcaseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h14" />
    </svg>
  );
}

function ClipboardIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6M9 5a3 3 0 0 1 6 0M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 12h6M9 16h4" />
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