// src/pages/jobs/Recommendations.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const tabs = [
  {
    key: 'personalized',
    label: 'For You',
    subtitle: 'Matched to your profile',
    icon: TargetIcon,
  },
  {
    key: 'trending',
    label: 'Trending',
    subtitle: 'Popular jobs right now',
    icon: FireIcon,
  },
  {
    key: 'recommended',
    label: 'Recommended',
    subtitle: 'Best open opportunities',
    icon: StarIcon,
  },
];

export default function Recommendations() {
  const [tab, setTab] = useState('personalized');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeTab = useMemo(
    () => tabs.find((item) => item.key === tab) || tabs[0],
    [tab]
  );

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      remote: jobs.filter((job) =>
        String(job.location || '').toLowerCase().includes('remote')
      ).length,
      fullTime: jobs.filter((job) =>
        String(job.job_type || '').toLowerCase().includes('full')
      ).length,
    };
  }, [jobs]);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get(`/recommendations/${tab}`);

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.jobs)
            ? res.data.jobs
            : [];

      setJobs(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load recommendations.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const ActiveIcon = activeTab.icon;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* HEADER */}
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-slate-950 shadow-xl shadow-slate-200/60">
          <div className="relative px-5 py-5 text-white sm:px-6">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-10 top-0 h-24 w-24 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-12 h-28 w-28 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Smart Job Matching
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-white">
                    <ActiveIcon className="h-6 w-6" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                      Job Recommendations
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                      Discover roles based on your profile, skills, and current hiring trends.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:min-w-96">
                <HeaderStat value={stats.total} label="Jobs" />
                <HeaderStat value={stats.remote} label="Remote" />
                <HeaderStat value={stats.fullTime} label="Full Time" />
              </div>
            </div>
          </div>
        </section>

        {/* TABS */}
        <section className="rounded-4xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid gap-2 sm:grid-cols-3">
              {tabs.map((item) => {
                const Icon = item.icon;
                const active = tab === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    className={`flex items-center gap-3 rounded-3xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        active ? 'bg-white text-indigo-700' : 'bg-white text-slate-500'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-black">{item.label}</p>
                      <p className="text-xs font-semibold opacity-75">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={fetchJobs}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
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
        </section>

        {/* JOB LIST */}
        <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                {activeTab.label}
              </p>

              <h2 className="text-xl font-black text-slate-950">
                Recommended Jobs
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {activeTab.subtitle}
              </p>
            </div>

            <p className="text-sm font-black text-slate-500">
              {jobs.length} result{jobs.length === 1 ? '' : 's'}
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl bg-slate-50">
              <div className="text-center">
                <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  Loading Recommendations
                </h3>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Finding suitable jobs for you...
                </p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                  <SearchIcon className="h-8 w-8" />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  No recommendations found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Complete your profile, add skills, or browse all jobs to discover more openings.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link
                    to="/profile"
                    className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                  >
                    Update Profile
                  </Link>

                  <Link
                    to="/jobs"
                    className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
                  >
                    Browse Jobs
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function JobCard({ job }) {
  return (
    <article className="group rounded-4xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-black text-slate-950 transition group-hover:text-indigo-700">
            {job.title || 'Untitled Job'}
          </h3>

          <p className="mt-1 text-sm font-bold text-slate-500">
            {getCompanyName(job)}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
          <BriefcaseIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.location && <Badge>{job.location}</Badge>}
        {job.job_type && <Badge>{job.job_type}</Badge>}
        {formatSalary(job.salary_min, job.salary_max) && (
          <Badge tone="green">{formatSalary(job.salary_min, job.salary_max)}</Badge>
        )}
      </div>

      {job.description && (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
          {job.description}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-slate-400">
          Posted {formatDate(job.created_at)}
        </p>

        <div className="flex gap-2">
          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
          >
            View Details
          </Link>

          <Link
            to={`/apply/${job.id}`}
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
          >
            Apply
          </Link>
        </div>
      </div>
    </article>
  );
}

function Badge({ children, tone = 'slate' }) {
  const styles =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-white text-slate-600';

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black shadow-sm ${styles}`}>
      {children}
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

function getCompanyName(job) {
  return (
    job?.company?.name ||
    job?.company_name ||
    job?.recruiter?.company_name ||
    job?.recruiter_company ||
    'Unknown Company'
  );
}

function formatSalary(min, max) {
  if (!min && !max) return '';

  const format = (value) =>
    Number(value || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });

  if (min && max) return `${format(min)} - ${format(max)}`;
  if (min) return `From ${format(min)}`;
  return `Up to ${format(max)}`;
}

function formatDate(dateValue) {
  if (!dateValue) return 'Recently';

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

function TargetIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  );
}

function FireIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c4 0 7-2.8 7-6.8 0-3.6-2.4-6-5-8.2-.8 2.4-2 3.8-3.5 5.2C9.8 9.5 8.4 7.8 6.5 6 6 9.5 5 11.7 5 15.2 5 19.2 8 22 12 22Z" />
    </svg>
  );
}

function StarIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}

function SearchIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
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

function SpinnerIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
    </svg>
  );
}