import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const [pageLoading, setPageLoading] = useState(true);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isJobSeeker = user?.role === 'JOB_SEEKER';

  const currentResume = useMemo(() => {
    return resumes.find((resume) => resume.is_current);
  }, [resumes]);

  const selectedResume = useMemo(() => {
    return resumes.find((resume) => String(resume.id) === String(selectedResumeId));
  }, [resumes, selectedResumeId]);

  const fetchJob = useCallback(async () => {
    try {
      setPageLoading(true);

      const res = await api.get(`/jobs/${jobId}`);
      setJob(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Job not found.');
      navigate('/jobs', { replace: true });
    } finally {
      setPageLoading(false);
    }
  }, [jobId, navigate]);

  const fetchResumes = useCallback(async () => {
    try {
      setResumesLoading(true);

      const res = await api.get('/resumes');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setResumes(list);

      const current = list.find((resume) => resume.is_current);
      if (current) {
        setSelectedResumeId(String(current.id));
      }
    } catch {
      setResumes([]);
    } finally {
      setResumesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJob();
    fetchResumes();
  }, [fetchJob, fetchResumes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!job) {
      toast.error('Job details not loaded.');
      return;
    }

    if (!isJobSeeker) {
      toast.error('Only job seekers can apply for jobs.');
      return;
    }

    if (coverLetter.length > 2000) {
      toast.error('Cover letter should be below 2000 characters.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Submitting application...');

    try {
      await api.post('/applications', {
        job_id: Number(jobId),
        cover_letter: coverLetter.trim(),
        resume_id: selectedResumeId ? Number(selectedResumeId) : null,
      });

      toast.update(toastId, {
        render: 'Application submitted successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1800,
      });

      navigate('/applications');
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Failed to apply.',
        type: 'error',
        isLoading: false,
        autoClose: 2600,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-4xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
          <div className="flex min-h-96 items-center justify-center">
            <div className="text-center">
              <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

              <h2 className="mt-4 text-xl font-black text-slate-950">
                Loading Job Details
              </h2>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                Preparing your application form...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  if (user && !isJobSeeker) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="w-full rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-200/70">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
              <ShieldIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              Job Seeker Access Only
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Recruiters and admins can view jobs, but only job seekers can submit applications.
            </p>

            <Link
              to="/jobs"
              className="mt-6 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
            >
              Back to Jobs
            </Link>
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

            <div className="relative z-10">
              <Link
                to="/jobs"
                className="mb-4 inline-flex items-center text-sm font-black text-slate-300 transition hover:text-white"
              >
                <ArrowLeftIcon className="mr-2 h-5 w-5" />
                Back to Jobs
              </Link>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Application Form
                  </div>

                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Apply for {job.title || 'this job'}
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    {job.company?.name || job.company_name || 'Unknown Company'} •{' '}
                    {job.location || 'Location not added'} •{' '}
                    {job.job_type || 'Job type not added'}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                  <p className="text-xs font-semibold text-slate-400">Salary</p>

                  <p className="mt-1 text-lg font-black text-white">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* JOB SUMMARY */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
                <BriefcaseIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Job Details
                </p>

                <h2 className="text-xl font-black text-slate-950">
                  Role Summary
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              <InfoRow
                icon={<BuildingIcon className="h-5 w-5" />}
                label="Company"
                value={job.company?.name || job.company_name || 'Unknown Company'}
              />

              <InfoRow
                icon={<LocationIcon className="h-5 w-5" />}
                label="Location"
                value={job.location || 'Location not added'}
              />

              <InfoRow
                icon={<ClockIcon className="h-5 w-5" />}
                label="Job Type"
                value={job.job_type || 'Job type not added'}
              />

              <InfoRow
                icon={<CalendarIcon className="h-5 w-5" />}
                label="Posted"
                value={formatDate(job.created_at)}
              />
            </div>

            {job.description && (
              <div className="mt-5 rounded-3xl bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-900">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {job.description}
                </p>
              </div>
            )}

            {job.requirements && (
              <div className="mt-4 rounded-3xl bg-indigo-50 p-4">
                <p className="text-sm font-black text-indigo-900">
                  Requirements
                </p>

                <p className="mt-2 text-sm leading-6 text-indigo-800">
                  {job.requirements}
                </p>
              </div>
            )}
          </section>

          {/* APPLY FORM */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-600 to-cyan-500 text-white shadow-lg shadow-emerald-500/25">
                <SendIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                  Submit Application
                </p>

                <h2 className="text-xl font-black text-slate-950">
                  Application Details
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* RESUME */}
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Attach Resume
                </label>

                {resumesLoading ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                    <SpinnerIcon className="h-5 w-5 animate-spin text-indigo-600" />
                    Loading resumes...
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-bold text-amber-800">
                      No resumes uploaded yet.
                    </p>

                    <Link
                      to="/resumes"
                      className="mt-2 inline-flex text-sm font-black text-amber-700 underline"
                    >
                      Upload resume
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option value="">Select a resume</option>

                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.title || `Resume ${resume.id}`}
                        {resume.is_current ? ' (Current)' : ''}
                      </option>
                    ))}
                  </select>
                )}

                {currentResume && selectedResume && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Selected: {selectedResume.title || `Resume ${selectedResume.id}`}
                  </p>
                )}
              </div>

              {/* COVER LETTER */}
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="block text-sm font-bold text-slate-700">
                    Cover Letter
                    <span className="font-semibold text-slate-400"> optional</span>
                  </label>

                  <span
                    className={`text-xs font-black ${
                      coverLetter.length > 2000
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {coverLetter.length}/2000
                  </span>
                </div>

                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={7}
                  placeholder="Tell the employer why you are a great fit..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <SendIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>

        <p className="truncate text-sm font-black text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

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

function BriefcaseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h14" />
    </svg>
  );
}

function BuildingIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1" />
    </svg>
  );
}

function LocationIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5h.01" />
    </svg>
  );
}

function ClockIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
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

function SendIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 3 10.5 13.5M21 3l-6 18-4.5-7.5L3 9l18-6Z" />
    </svg>
  );
}

function ShieldIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-3 7-10V5l-7-3-7 3v6c0 7 7 10 7 10Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-5" />
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

function SpinnerIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
    </svg>
  );
}