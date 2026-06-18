import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [companyReviews, setCompanyReviews] = useState({
    count: 0,
    average: null,
  });

  const [reviewsLoading, setReviewsLoading] = useState(false);

  const role = String(user?.role || '').toUpperCase();
  const isJobSeeker = role === 'JOB_SEEKER';
  const isRecruiter = role === 'RECRUITER';
  const isAdmin = role === 'ADMIN';

  const fetchCompanyReviewSummary = useCallback(async (companyId) => {
    if (!companyId) {
      setCompanyReviews({
        count: 0,
        average: null,
      });
      return;
    }

    try {
      setReviewsLoading(true);

      const res = await api.get(`/reviews/company/${companyId}`);

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.reviews)
          ? res.data.reviews
          : [];

      const count = list.length;

      const average =
        count > 0
          ? (
              list.reduce((sum, review) => {
                return sum + Number(review.rating || 0);
              }, 0) / count
            ).toFixed(1)
          : null;

      setCompanyReviews({
        count,
        average,
      });
    } catch {
      setCompanyReviews({
        count: 0,
        average: null,
      });
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get(`/jobs/${id}`);
      const jobData = res.data;

      let companyName = getCompanyName(jobData);

      if (!companyName && getCompanyId(jobData)) {
        companyName = await getCompanyNameFromCompanies(getCompanyId(jobData));
      }

      const finalJob = {
        ...jobData,
        display_company_name: companyName || 'Company not added',
      };

      setJob(finalJob);

      const companyId = getCompanyId(finalJob);
      await fetchCompanyReviewSummary(companyId);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Job not found.');
      navigate('/jobs', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, fetchCompanyReviewSummary]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-4xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
          <div className="flex min-h-96 items-center justify-center">
            <div className="text-center">
              <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

              <h2 className="mt-4 text-xl font-black text-slate-950">
                Loading Job Details
              </h2>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                Fetching job information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const companyName =
    job.display_company_name || getCompanyName(job) || 'Company not added';

  const companyId = getCompanyId(job);

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
                    Job Details
                  </div>

                  <h1 className="max-w-3xl text-2xl font-black tracking-tight sm:text-3xl">
                    {job.title || 'Untitled Job'}
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    {companyName} • {job.location || 'Location not added'} •{' '}
                    {job.job_type || 'Job type not added'}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                  <p className="text-xs font-semibold text-slate-400">
                    Salary
                  </p>

                  <p className="mt-1 text-lg font-black text-white">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {/* DETAILS */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
                <BriefcaseIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Role Information
                </p>

                <h2 className="text-xl font-black text-slate-950">
                  About this job
                </h2>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard
                icon={<BuildingIcon className="h-5 w-5" />}
                label="Company"
                value={companyName}
              />

              <InfoCard
                icon={<LocationIcon className="h-5 w-5" />}
                label="Location"
                value={job.location || 'Location not added'}
              />

              <InfoCard
                icon={<ClockIcon className="h-5 w-5" />}
                label="Job Type"
                value={job.job_type || 'Job type not added'}
              />

              <InfoCard
                icon={<CalendarIcon className="h-5 w-5" />}
                label="Posted"
                value={formatDate(job.created_at)}
              />
            </div>

            <ContentSection title="Description">
              {job.description || 'No description added for this job.'}
            </ContentSection>

            {job.requirements && (
              <ContentSection title="Requirements" tone="indigo">
                {job.requirements}
              </ContentSection>
            )}
          </section>

          {/* ACTION PANEL */}
          <aside className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-600 to-cyan-500 text-white shadow-lg shadow-emerald-500/25">
                <SendIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                  Action
                </p>

                <h2 className="text-xl font-black text-slate-950">
                  Apply for this role
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Badge icon={<BriefcaseIcon className="h-4 w-4" />}>
                {job.job_type || 'Job type not added'}
              </Badge>

              <Badge icon={<LocationIcon className="h-4 w-4" />}>
                {job.location || 'Location not added'}
              </Badge>

              <Badge icon={<CurrencyIcon className="h-4 w-4" />}>
                {formatSalary(job.salary_min, job.salary_max)}
              </Badge>
            </div>

            {/* COMPANY REVIEWS */}
            {companyId && (
              <Link
                to={`/reviews/company/${companyId}`}
                className="mt-5 block rounded-3xl border border-indigo-200 bg-indigo-50 p-4 transition hover:-translate-y-0.5 hover:bg-indigo-100 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm ring-1 ring-indigo-100">
                    <StarIcon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-indigo-800">
                      Reviews for {companyName}
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {reviewsLoading
                        ? 'Loading company ratings...'
                        : companyReviews.count > 0
                          ? `${companyReviews.average} out of 5 · ${companyReviews.count} review${companyReviews.count !== 1 ? 's' : ''}`
                          : 'No reviews yet'}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-sm font-black text-amber-600 ring-1 ring-indigo-100">
                    {reviewsLoading
                      ? '...'
                      : companyReviews.count > 0
                        ? `${companyReviews.average} ★`
                        : '⭐'}
                  </div>
                </div>
              </Link>
            )}

            <div className="mt-5 rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-900">
                Ready to apply?
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Attach your resume and submit a cover letter from the application page.
              </p>
            </div>

            <div className="mt-5">
              {user && isJobSeeker ? (
                <Link
                  to={`/apply/${job.id}`}
                  className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40"
                >
                  Apply Now
                  <SendIcon className="ml-2 h-5 w-5" />
                </Link>
              ) : !user ? (
                <Link
                  to="/login"
                  className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40"
                >
                  Login to Apply
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              ) : isRecruiter ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <p className="text-sm font-black text-amber-800">
                    Recruiters cannot apply for jobs.
                  </p>

                  <Link
                    to="/manage-jobs"
                    className="mt-3 inline-flex text-sm font-black text-amber-700 underline"
                  >
                    Manage your jobs
                  </Link>
                </div>
              ) : isAdmin ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-sm font-black text-slate-700">
                    Admins can view jobs, but cannot apply.
                  </p>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-sm font-black text-slate-700">
                    Only job seekers can apply.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function InfoCard({ icon, label, value }) {
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

function ContentSection({ title, children, tone = 'slate' }) {
  const styles =
    tone === 'indigo'
      ? 'border-indigo-100 bg-indigo-50 text-indigo-900'
      : 'border-slate-200 bg-slate-50 text-slate-700';

  return (
    <div className={`mt-5 rounded-3xl border p-5 ${styles}`}>
      <h3 className="text-base font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-3 whitespace-pre-line text-sm leading-7">
        {children}
      </p>
    </div>
  );
}

function Badge({ icon, children }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
      <span className="text-indigo-600">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

/* ================= HELPERS ================= */

function getCompanyId(job) {
  return (
    job?.company_id ||
    job?.company?.id ||
    job?.recruiter?.company_id ||
    job?.recruiter?.company?.id ||
    null
  );
}

function getCompanyName(job) {
  return (
    job?.display_company_name ||
    job?.company?.name ||
    job?.company?.company_name ||
    job?.company?.business_name ||
    job?.company?.organization_name ||
    job?.company_name ||
    job?.business_name ||
    job?.organization_name ||
    job?.recruiter?.company?.name ||
    job?.recruiter?.company?.company_name ||
    job?.recruiter?.company_name ||
    job?.recruiter_company_name ||
    job?.employer_name ||
    ''
  );
}

async function getCompanyNameFromCompanies(companyId) {
  try {
    const res = await api.get('/companies');

    const companies = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

    const company = companies.find(
      (item) => String(item.id) === String(companyId)
    );

    return (
      company?.name ||
      company?.company_name ||
      company?.business_name ||
      company?.organization_name ||
      ''
    );
  } catch {
    return '';
  }
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

function StarIcon(props) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.75 14.84 8.5l6.35.92-4.6 4.48 1.08 6.32L12 17.24l-5.67 2.98 1.08-6.32-4.6-4.48 6.35-.92L12 2.75Z" />
    </svg>
  );
}

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

function CurrencyIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 5h10M7 9h10M8 5c4 0 6 1.6 6 4s-2 4-6 4h3l5 6M8 13h-1" />
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

function ArrowLeftIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
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