import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

export default function SavedJobs() {
  const { user } = useContext(AuthContext);

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const fetchSavedJobs = useCallback(async () => {
    if (!user) {
      setSavedJobs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await api.get('/saved-jobs');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setSavedJobs(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load saved jobs.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleRemove = async (savedId) => {
    try {
      setRemovingId(savedId);

      await api.delete(`/saved-jobs/${savedId}`);

      setSavedJobs((prev) =>
        prev.filter((saved) => String(saved.id) !== String(savedId))
      );

      toast.success('Job removed from saved jobs.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove saved job.');
    } finally {
      setRemovingId(null);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-4xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
          <div className="flex min-h-96 items-center justify-center">
            <div className="text-center">
              <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

              <h2 className="mt-4 text-xl font-black text-slate-950">
                Loading Saved Jobs
              </h2>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                Fetching your bookmarked jobs...
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
              <div className="absolute left-8 top-3 h-28 w-28 rounded-full bg-amber-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Saved Jobs
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  My Saved Jobs
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Keep your favorite opportunities in one place and apply when you are ready.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:min-w-72">
                <HeaderStat value={savedJobs.length} label="Saved" />
                <HeaderStat value="★" label="Bookmarks" />
              </div>
            </div>
          </div>
        </section>

        {/* TOOLBAR */}
        <section className="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-600">
                Job Bookmarks
              </p>

              <h2 className="text-xl font-black text-slate-950">
                Saved Opportunities
              </h2>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={fetchSavedJobs}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
              >
                <RefreshIcon className="mr-2 h-5 w-5" />
                Refresh
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
          {savedJobs.length === 0 ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-amber-500 shadow-sm">
                  <BookmarkIcon className="h-8 w-8" />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  No saved jobs yet
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Save jobs from the Find Jobs page. Your bookmarked roles will appear here.
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
              {savedJobs.map((saved) => (
                <SavedJobCard
                  key={saved.id}
                  saved={saved}
                  removingId={removingId}
                  onRemove={handleRemove}
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

function SavedJobCard({ saved, removingId, onRemove }) {
  const jobId = getJobId(saved);
  const title = getJobTitle(saved);
  const company = getCompanyName(saved);
  const location = getLocation(saved);
  const jobType = getJobType(saved);
  const salary = formatSalary(
    saved?.salary_min || saved?.job?.salary_min,
    saved?.salary_max || saved?.job?.salary_max
  );

  const isRemoving = String(removingId) === String(saved.id);

  return (
    <article className="rounded-4xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm">
            <BookmarkIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <Link
              to={`/jobs/${jobId}`}
              className="text-lg font-black text-slate-950 transition hover:text-indigo-700"
            >
              {title}
            </Link>

            <p className="mt-1 text-sm font-bold text-slate-600">
              {company} • {location}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{jobType}</Badge>
              <Badge>{salary}</Badge>
              <Badge>Saved: {formatDate(saved.saved_at || saved.created_at)}</Badge>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          {jobId && (
            <Link
              to={`/jobs/${jobId}`}
              className="inline-flex items-center rounded-2xl bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
            >
              View Details
            </Link>
          )}

          {jobId && (
            <Link
              to={`/apply/${jobId}`}
              className="inline-flex items-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5"
            >
              Apply Now
            </Link>
          )}

          <button
            type="button"
            onClick={() => onRemove(saved.id)}
            disabled={isRemoving}
            className="inline-flex items-center rounded-2xl bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isRemoving ? (
              <>
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                Removing
              </>
            ) : (
              'Remove'
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm">
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

function getJobId(saved) {
  return saved?.job_id || saved?.job?.id || saved?.id;
}

function getJobTitle(saved) {
  return (
    saved?.job_title ||
    saved?.title ||
    saved?.job?.title ||
    'Job Title'
  );
}

function getCompanyName(saved) {
  return (
    saved?.company_name ||
    saved?.job?.company?.name ||
    saved?.job?.company_name ||
    saved?.job?.recruiter?.company?.name ||
    'Company not added'
  );
}

function getLocation(saved) {
  return (
    saved?.location ||
    saved?.job?.location ||
    'Location not added'
  );
}

function getJobType(saved) {
  return (
    saved?.job_type ||
    saved?.job?.job_type ||
    'Job type not added'
  );
}

function formatSalary(min, max) {
  if (!min && !max) return 'Salary not added';

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

function BookmarkIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v17l-6-4-6 4V4Z" />
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