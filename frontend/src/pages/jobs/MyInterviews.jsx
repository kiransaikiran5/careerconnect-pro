// src/pages/jobs/MyInterviews.jsx
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

const statusStyles = {
  Scheduled: 'border-blue-200 bg-blue-50 text-blue-700',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Cancelled: 'border-red-200 bg-red-50 text-red-700',
};

export default function MyInterviews() {
  const { user } = useContext(AuthContext);

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = String(user?.role || '').toUpperCase();
  const isJobSeeker = role === 'JOB_SEEKER';

  const stats = useMemo(() => {
    return {
      total: interviews.length,
      scheduled: interviews.filter(
        (item) => normalizeStatus(item.status) === 'Scheduled'
      ).length,
      completed: interviews.filter(
        (item) => normalizeStatus(item.status) === 'Completed'
      ).length,
      cancelled: interviews.filter(
        (item) => normalizeStatus(item.status) === 'Cancelled'
      ).length,
    };
  }, [interviews]);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get('/interviews/my');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setInterviews(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load interviews.');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleCopyLink = async (link) => {
    if (!link) {
      toast.error('Meeting link not available.');
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      toast.success('Meeting link copied.');
    } catch {
      toast.error('Failed to copy meeting link.');
    }
  };

  if (user && !isJobSeeker) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-4xl border border-red-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
            <LockIcon className="h-8 w-8" />
          </div>

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Access Denied
          </h1>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            This page is only for job seekers.
          </p>

          <Link
            to="/jobs"
            className="mt-5 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
          >
            Go to Jobs
          </Link>
        </div>
      </div>
    );
  }

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
                  Candidate Interview Center
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  My Interviews
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                  View your scheduled interviews, meeting links, notes, and recruiter feedback.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:min-w-110">
                <HeaderStat value={stats.total} label="Total" />
                <HeaderStat value={stats.scheduled} label="Scheduled" />
                <HeaderStat value={stats.completed} label="Done" />
                <HeaderStat value={stats.cancelled} label="Cancelled" />
              </div>
            </div>
          </div>
        </section>

        {/* TOOLBAR */}
        <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                Interview Schedule
              </p>

              <h2 className="text-xl font-black text-slate-950">
                Upcoming and Completed Interviews
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Join online interviews directly from this page.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchInterviews}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing
                </>
              ) : (
                <>
                  <RefreshIcon className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </section>

        {/* LIST */}
        <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          {loading ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl bg-slate-50">
              <div className="text-center">
                <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  Loading Interviews
                </h3>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Fetching your interview schedule...
                </p>
              </div>
            </div>
          ) : interviews.length === 0 ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                  <CalendarIcon className="h-8 w-8" />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  No interviews scheduled
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Once a recruiter schedules your interview, it will appear here.
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
            <div className="grid gap-3">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onCopyLink={handleCopyLink}
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

function InterviewCard({ interview, onCopyLink }) {
  const status = normalizeStatus(interview.status);
  const meetingLink = getSafeMeetingLink(interview.location);
  const hasLocationText = Boolean(interview.location);

  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <CalendarIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-slate-950">
                {interview.job_title || interview.job?.title || 'Interview'}
              </h3>

              <StatusBadge status={status} />
            </div>

            <p className="mt-1 text-sm font-bold text-slate-500">
              {formatDateTime(interview.scheduled_at)}
            </p>

            {hasLocationText && (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Meeting / Location
                </p>

                <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-700">
                  {interview.location}
                </p>
              </div>
            )}

            {interview.notes && (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                <span className="font-black text-slate-800">Notes:</span>{' '}
                {interview.notes}
              </p>
            )}

            {status === 'Completed' && interview.feedback && (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                <span className="font-black text-slate-800">Feedback:</span>{' '}
                {interview.feedback}
              </p>
            )}

            {status !== 'Completed' && interview.feedback && (
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Feedback will be visible after completion.
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
          {meetingLink ? (
            <a
              href={meetingLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
            >
              Join Meeting
            </a>
          ) : (
            <span className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-500">
              No Online Link
            </span>
          )}

          {interview.location && (
            <button
              type="button"
              onClick={() => onCopyLink(interview.location)}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-50 px-4 py-2 text-xs font-black text-cyan-700 transition hover:bg-cyan-100"
            >
              Copy Link
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-black ${
        statusStyles[status] || 'border-slate-200 bg-slate-100 text-slate-600'
      }`}
    >
      {status}
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

function normalizeStatus(status) {
  if (!status) return 'Scheduled';

  const clean = String(status).trim();

  if (clean.includes('_')) {
    return clean
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function formatDateTime(dateValue) {
  if (!dateValue) return 'Date not added';

  return new Date(dateValue).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSafeMeetingLink(link) {
  if (!link) return '';

  const cleaned = String(link).trim();

  if (!cleaned) return '';

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return cleaned;
  }

  if (
    cleaned.includes('meet.google.com') ||
    cleaned.includes('zoom.us') ||
    cleaned.includes('teams.microsoft.com')
  ) {
    return `https://${cleaned}`;
  }

  return '';
}

/* ================= ICONS ================= */

function CalendarIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v3M17 3v3M4 8h16M5 5h14v16H5V5Z" />
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

function LockIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6V10Z" />
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