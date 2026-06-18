// src/pages/recruiter/Candidates.jsx
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

const statusOptions = [
  'ALL',
  'APPLIED',
  'SHORTLISTED',
  'REJECTED',
  'INTERVIEW_SCHEDULED',
  'OFFERED',
];

const statusStyles = {
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
  SHORTLISTED: 'bg-amber-50 text-amber-700 border-amber-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  INTERVIEW_SCHEDULED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OFFERED: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function Candidates() {
  const { jobId } = useParams();
  const { user } = useContext(AuthContext);

  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [loading, setLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [resumeLoadingId, setResumeLoadingId] = useState(null);

  const role = String(user?.role || '').toUpperCase();
  const isRecruiter = role === 'RECRUITER';
  const isAdmin = role === 'ADMIN';

  const candidateCount = useMemo(() => applicants.length, [applicants]);

  const fetchJob = useCallback(async () => {
    try {
      setJobLoading(true);

      const res = await api.get(`/jobs/${jobId}`);
      setJob(res.data);
    } catch {
      setJob(null);
    } finally {
      setJobLoading(false);
    }
  }, [jobId]);

  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};

      if (statusFilter && statusFilter !== 'ALL') {
        params.status_filter = statusFilter;
      }

      const res = await api.get(`/shortlisting/jobs/${jobId}/applications`, {
        params,
      });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setApplicants(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  }, [jobId, statusFilter]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleAction = async (applicationId, action) => {
    if (!applicationId) {
      toast.error('Application id not found.');
      return;
    }

    try {
      setActionLoadingId(`${applicationId}-${action}`);

      if (action === 'shortlist') {
        await api.put(`/shortlisting/applications/${applicationId}/shortlist`);
        toast.success('Candidate shortlisted successfully.');
      }

      if (action === 'reject') {
        await api.put(`/shortlisting/applications/${applicationId}/reject`);
        toast.success('Candidate rejected successfully.');
      }

      await fetchApplicants();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewResume = async (app) => {
    const applicationId = getApplicationId(app);

    if (!applicationId) {
      toast.error('Application id not found.');
      return;
    }

    try {
      setResumeLoadingId(applicationId);

      const res = await api.get(
        `/shortlisting/applications/${applicationId}/resume/download`,
        {
          responseType: 'blob',
        }
      );

      const contentType =
        res.headers['content-type'] || 'application/octet-stream';

      const blob = new Blob([res.data], {
        type: contentType,
      });

      const fileUrl = window.URL.createObjectURL(blob);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');

      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 30000);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          'Failed to open resume. Please check backend permission.'
      );
    } finally {
      setResumeLoadingId(null);
    }
  };

  if (user && !isRecruiter && !isAdmin) {
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
            Only recruiters and admins can view candidates.
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

  const pageTitle = job?.title || `Job #${jobId}`;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="relative bg-slate-950 px-5 py-7 text-white sm:px-8">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-8 top-4 h-32 w-32 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-10 h-36 w-36 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Link
                  to="/manage-jobs"
                  className="mb-4 inline-flex items-center text-sm font-black text-slate-300 transition hover:text-white"
                >
                  <ArrowLeftIcon className="mr-2 h-5 w-5" />
                  Back to Jobs
                </Link>

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Candidate Shortlisting
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Candidates
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  {jobLoading
                    ? 'Loading job details...'
                    : `Applications for ${pageTitle}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:min-w-72">
                <HeaderStat value={candidateCount} label="Candidates" />
                <HeaderStat value={formatStatus(statusFilter)} label="Filter" />
              </div>
            </div>
          </div>
        </section>

        {/* FILTER */}
        <section className="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                Filter Candidates
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                {pageTitle}
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Review applicants, open resumes, and update their shortlisting status.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Application Status
                </label>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm font-black text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 sm:w-72"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>

                  <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <button
                type="button"
                onClick={fetchApplicants}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
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
          </div>
        </section>

        {/* LIST */}
        <section className="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          {loading ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl bg-slate-50">
              <div className="text-center">
                <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  Loading Candidates
                </h3>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Fetching applicants for this job...
                </p>
              </div>
            </div>
          ) : applicants.length === 0 ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                  <UsersIcon className="h-8 w-8" />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  No candidates found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  No applications match the selected status. Try changing the filter.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {applicants.map((app) => {
                const applicationId = getApplicationId(app);

                return (
                  <CandidateCard
                    key={applicationId}
                    app={app}
                    applicationId={applicationId}
                    actionLoadingId={actionLoadingId}
                    resumeLoadingId={resumeLoadingId}
                    onAction={handleAction}
                    onViewResume={handleViewResume}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function CandidateCard({
  app,
  applicationId,
  actionLoadingId,
  resumeLoadingId,
  onAction,
  onViewResume,
}) {
  const status = app.status || 'APPLIED';
  const applicantName = getApplicantName(app);
  const applicantEmail = getApplicantEmail(app);
  const resumeTitle = getResumeTitle(app);
  const coverLetter = app.cover_letter || app.message || '';

  const shortlistLoading = actionLoadingId === `${applicationId}-shortlist`;
  const rejectLoading = actionLoadingId === `${applicationId}-reject`;
  const resumeLoading = String(resumeLoadingId) === String(applicationId);

  return (
    <article className="rounded-4xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <UserIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-black text-slate-950">
              {applicantName}
            </h3>

            <p className="mt-1 text-sm font-bold text-slate-500">
              {applicantEmail}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={status} />

              <Badge>
                Applied: {formatDate(app.applied_at || app.created_at)}
              </Badge>

              {resumeTitle && <Badge>Resume: {resumeTitle}</Badge>}
            </div>

            {coverLetter && (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Cover Letter
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {coverLetter}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => onViewResume(app)}
            disabled={resumeLoading}
            className="inline-flex items-center rounded-2xl bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {resumeLoading ? (
              <>
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                Opening
              </>
            ) : (
              'View Resume'
            )}
          </button>

          {status === 'APPLIED' && (
            <>
              <button
                type="button"
                onClick={() => onAction(applicationId, 'shortlist')}
                disabled={shortlistLoading || rejectLoading}
                className="inline-flex items-center rounded-2xl bg-amber-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {shortlistLoading ? (
                  <>
                    <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                    Shortlisting
                  </>
                ) : (
                  'Shortlist'
                )}
              </button>

              <button
                type="button"
                onClick={() => onAction(applicationId, 'reject')}
                disabled={shortlistLoading || rejectLoading}
                className="inline-flex items-center rounded-2xl bg-red-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {rejectLoading ? (
                  <>
                    <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting
                  </>
                ) : (
                  'Reject'
                )}
              </button>
            </>
          )}

          {status !== 'APPLIED' && (
            <span className="inline-flex items-center rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-500">
              Action completed
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
        statusStyles[status] || 'border-slate-200 bg-slate-100 text-slate-600'
      }`}
    >
      {formatStatus(status)}
    </span>
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
      <p className="truncate text-xl font-black leading-none text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] font-semibold text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* ================= HELPERS ================= */

function getApplicationId(app) {
  return app?.application_id || app?.id || '';
}

function getApplicantName(app) {
  return (
    app?.applicant_name ||
    app?.candidate_name ||
    app?.user?.name ||
    app?.applicant?.name ||
    'Unknown Candidate'
  );
}

function getApplicantEmail(app) {
  return (
    app?.applicant_email ||
    app?.candidate_email ||
    app?.user?.email ||
    app?.applicant?.email ||
    'Email not added'
  );
}

function getResumeTitle(app) {
  return app?.resume_title || app?.resume?.title || app?.resume_name || '';
}

function formatStatus(status) {
  if (!status) return 'Unknown';

  if (status === 'ALL') return 'All Statuses';

  return String(status)
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

function UserIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19a6 6 0 0 0-12 0M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM21 19a4.5 4.5 0 0 0-6-4.2M16 3.3a4 4 0 0 1 0 7.4" />
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

function ArrowLeftIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
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

function ChevronDownIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
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