import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

const emptyForm = {
  company_id: '',
  title: '',
  department: '',
  phone: '',
};

export default function RecruiterProfile() {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [companies, setCompanies] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [reviewSummary, setReviewSummary] = useState({
    count: 0,
    average: null,
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const userRole = String(user?.role || '').toUpperCase();
  const canAccess = userRole === 'RECRUITER' || userRole === 'ADMIN';

  const recruiterReviewId = useMemo(() => {
    return getRecruiterReviewId(profile, user);
  }, [profile, user]);

  const selectedCompany = useMemo(() => {
    if (!form.company_id) return null;

    return companies.find(
      (company) => String(company.id) === String(form.company_id)
    );
  }, [companies, form.company_id]);

  const fetchRecruiterReviewSummary = useCallback(async (recruiterId) => {
    if (!recruiterId) {
      setReviewSummary({
        count: 0,
        average: null,
      });
      return;
    }

    try {
      setReviewsLoading(true);

      const res = await api.get(`/reviews/recruiter/${recruiterId}`);

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

      setReviewSummary({
        count,
        average,
      });
    } catch {
      setReviewSummary({
        count: 0,
        average: null,
      });
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setPageLoading(true);

      const res = await api.get('/recruiters/me');

      setProfile(res.data);

      setForm({
        company_id: res.data?.company_id ? String(res.data.company_id) : '',
        title: res.data?.title || '',
        department: res.data?.department || '',
        phone: res.data?.phone || '',
      });
    } catch (err) {
      setProfile(null);

      if (err.response?.status === 404) {
        toast.info('Recruiter profile not found.');
      } else {
        toast.error(err.response?.data?.detail || 'Failed to load recruiter profile.');
      }
    } finally {
      setPageLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true);

      const res = await api.get('/companies');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setCompanies(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load companies.');
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchCompanies();
  }, [fetchProfile, fetchCompanies]);

  useEffect(() => {
    if (profile) {
      fetchRecruiterReviewSummary(recruiterReviewId);
    }
  }, [profile, recruiterReviewId, fetchRecruiterReviewSummary]);

  const handleUpdate = async (event) => {
    event.preventDefault();

    setUpdateLoading(true);
    const toastId = toast.loading('Updating recruiter profile...');

    const payload = {
      company_id: form.company_id ? Number(form.company_id) : null,
      title: form.title.trim(),
      department: form.department.trim(),
      phone: form.phone.trim(),
    };

    try {
      const res = await api.put('/recruiters/me', payload);

      setProfile(res.data);

      setForm({
        company_id: res.data?.company_id ? String(res.data.company_id) : '',
        title: res.data?.title || '',
        department: res.data?.department || '',
        phone: res.data?.phone || '',
      });

      toast.update(toastId, {
        render: 'Recruiter profile updated successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Profile update failed.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  if (!canAccess) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="w-full rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-200/70">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
              <ShieldIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              Access Denied
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              This page is available only for recruiters and admins.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-center">
          <div className="w-full rounded-4xl border border-slate-200 bg-white p-10 text-center shadow-2xl shadow-slate-200/70">
            <SpinnerIcon className="mx-auto h-9 w-9 animate-spin text-indigo-600" />

            <p className="mt-4 text-sm font-bold text-slate-500">
              Loading recruiter profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="w-full rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-200/70">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
              <UserTieIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              Recruiter Profile Not Found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your account is not registered as a recruiter yet. Please contact admin or create recruiter access from backend.
            </p>

            <button
              type="button"
              onClick={fetchProfile}
              className="mt-6 rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recruiterName =
    user?.full_name ||
    user?.name ||
    user?.email ||
    profile?.email ||
    'Recruiter';

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="relative bg-slate-950 px-5 py-5 text-white sm:px-7">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-8 top-3 h-28 w-28 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Recruiter Center
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Recruiter Profile
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                  Manage your company, title, department, contact details, and recruiter reviews.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Verification Status
                </p>

                {profile.is_verified ? (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-sm font-black text-emerald-300">
                    <CheckCircleIcon className="h-4 w-4" />
                    Verified
                  </div>
                ) : (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1.5 text-sm font-black text-amber-300">
                    <ClockIcon className="h-4 w-4" />
                    Pending Verification
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          {/* PROFILE SUMMARY */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
                <UserTieIcon className="h-8 w-8" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Profile Summary
                </p>

                <h2 className="truncate text-xl font-black text-slate-950">
                  {recruiterName}
                </h2>

                <p className="truncate text-sm font-semibold text-slate-500">
                  {user?.email || profile?.email || 'No email found'}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <SummaryItem
                icon={<BuildingIcon className="h-5 w-5" />}
                label="Company"
                value={selectedCompany?.name || 'Not selected'}
              />

              <SummaryItem
                icon={<BriefcaseIcon className="h-5 w-5" />}
                label="Title"
                value={form.title || 'Not added'}
              />

              <SummaryItem
                icon={<DepartmentIcon className="h-5 w-5" />}
                label="Department"
                value={form.department || 'Not added'}
              />

              <SummaryItem
                icon={<PhoneIcon className="h-5 w-5" />}
                label="Phone"
                value={form.phone || 'Not added'}
              />
            </div>

            {selectedCompany && (
              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Selected Company
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                    <BuildingIcon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {selectedCompany.name}
                    </p>

                    <p className="truncate text-xs font-semibold text-slate-500">
                      {selectedCompany.location || 'Location not added'}
                    </p>
                  </div>
                </div>

                {selectedCompany.is_verified ? (
                  <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                    Company Verified
                  </span>
                ) : (
                  <span className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                    Company Pending
                  </span>
                )}
              </div>
            )}

            {/* REVIEWS BUTTON */}
            {recruiterReviewId ? (
              <Link
                to={`/reviews/recruiter/${recruiterReviewId}`}
                className="mt-5 block rounded-3xl border border-indigo-200 bg-indigo-50 p-4 transition hover:-translate-y-0.5 hover:bg-indigo-100 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm ring-1 ring-indigo-100">
                    <StarIcon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-indigo-800">
                      View Ratings & Reviews
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {reviewsLoading
                        ? 'Loading recruiter ratings...'
                        : reviewSummary.count > 0
                          ? `${reviewSummary.average} out of 5 · ${reviewSummary.count} review${reviewSummary.count !== 1 ? 's' : ''}`
                          : 'No reviews yet'}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-sm font-black text-amber-600 ring-1 ring-indigo-100">
                    {reviewsLoading
                      ? '...'
                      : reviewSummary.count > 0
                        ? `${reviewSummary.average} ★`
                        : '⭐'}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-black text-amber-900">
                  Reviews unavailable
                </p>

                <p className="mt-1 text-xs font-semibold text-amber-700">
                  Recruiter id was not found in profile response.
                </p>
              </div>
            )}
          </section>

          {/* UPDATE FORM */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                  Edit Details
                </p>

                <h2 className="text-xl font-black text-slate-950">
                  Update Recruiter Information
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  fetchProfile();
                  fetchCompanies();
                }}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Company
                </label>

                <div className="relative">
                  <BuildingIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <select
                    value={form.company_id}
                    onChange={(event) =>
                      setForm({ ...form, company_id: event.target.value })
                    }
                    disabled={companiesLoading}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="">
                      {companiesLoading ? 'Loading companies...' : 'Select a company'}
                    </option>

                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <Input
                label="Title"
                icon={<BriefcaseIcon className="h-5 w-5" />}
                placeholder="Example: HR Manager"
                value={form.title}
                onChange={(value) => setForm({ ...form, title: value })}
              />

              <Input
                label="Department"
                icon={<DepartmentIcon className="h-5 w-5" />}
                placeholder="Example: Human Resources"
                value={form.department}
                onChange={(value) => setForm({ ...form, department: value })}
              />

              <Input
                label="Phone"
                icon={<PhoneIcon className="h-5 w-5" />}
                placeholder="Example: +91 98765 43210"
                value={form.phone}
                onChange={(value) => setForm({ ...form, phone: value })}
              />

              <button
                type="submit"
                disabled={updateLoading}
                className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {updateLoading ? (
                  <>
                    <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    Save Profile
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
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

function Input({ label, value, onChange, placeholder, icon }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </div>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-black text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function getRecruiterReviewId(profile, user) {
  return (
    profile?.id ||
    profile?.recruiter_id ||
    profile?.recruiter?.id ||
    user?.recruiter_id ||
    user?.recruiter?.id ||
    null
  );
}

/* ================= ICONS ================= */

function StarIcon(props) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.75 14.84 8.5l6.35.92-4.6 4.48 1.08 6.32L12 17.24l-5.67 2.98 1.08-6.32-4.6-4.48 6.35-.92L12 2.75Z" />
    </svg>
  );
}

function UserTieIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m10 14 2 2 2-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m11 16-1 5M13 16l1 5" />
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

function BriefcaseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h14" />
    </svg>
  );
}

function DepartmentIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16M8 6v12M16 6v12" />
    </svg>
  );
}

function PhoneIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.6 3.8 9 3l2.2 5.1-1.5 1.2a12.5 12.5 0 0 0 5 5l1.2-1.5L21 15l-.8 2.4A3.5 3.5 0 0 1 16.8 20 12.8 12.8 0 0 1 4 7.2a3.5 3.5 0 0 1 2.6-3.4Z" />
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

function ClockIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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

function ChevronDownIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
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