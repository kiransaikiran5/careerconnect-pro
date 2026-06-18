// src/pages/admin/AdminRecruiters.jsx
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

export default function AdminRecruiters() {
  const { user } = useContext(AuthContext);

  const [recruiters, setRecruiters] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [verifyTarget, setVerifyTarget] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const fetchRecruiters = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshLoading(true);
      } else {
        setPageLoading(true);
      }

      const res = await api.get('/recruiters');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setRecruiters(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to fetch recruiters.');
    } finally {
      setPageLoading(false);
      setRefreshLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  const totalRecruiters = recruiters.length;
  const verifiedRecruiters = recruiters.filter((item) => item.is_verified).length;
  const pendingRecruiters = recruiters.filter((item) => !item.is_verified).length;

  const filteredRecruiters = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return recruiters.filter((recruiter) => {
      const email = getRecruiterEmail(recruiter).toLowerCase();
      const company = getRecruiterCompany(recruiter).toLowerCase();
      const title = getRecruiterTitle(recruiter).toLowerCase();

      const matchesSearch =
        !search ||
        email.includes(search) ||
        company.includes(search) ||
        title.includes(search);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'VERIFIED' && recruiter.is_verified) ||
        (statusFilter === 'PENDING' && !recruiter.is_verified);

      return matchesSearch && matchesStatus;
    });
  }, [recruiters, searchTerm, statusFilter]);

  const openVerifyModal = (recruiter) => {
    setVerifyTarget(recruiter);
  };

  const closeVerifyModal = () => {
    if (verifyLoading) return;
    setVerifyTarget(null);
  };

  const confirmVerifyRecruiter = async () => {
    if (!verifyTarget?.id) return;

    setVerifyLoading(true);
    const toastId = toast.loading('Verifying recruiter...');

    try {
      await api.put(`/recruiters/${verifyTarget.id}/verify`);

      setRecruiters((prev) =>
        prev.map((item) =>
          item.id === verifyTarget.id ? { ...item, is_verified: true } : item
        )
      );

      toast.update(toastId, {
        render: 'Recruiter verified successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      setVerifyTarget(null);
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Verification failed.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  if (user && !isAdmin) {
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
              Only admin users can manage recruiter verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
            <div className="flex min-h-96 items-center justify-center">
              <div className="text-center">
                <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

                <h2 className="mt-4 text-xl font-black text-slate-950">
                  Loading Recruiters
                </h2>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Preparing recruiter verification panel...
                </p>
              </div>
            </div>
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
                  Admin Control
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Recruiters Management
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                  Review recruiter accounts, check company details, and approve pending recruiter profiles.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchRecruiters(true)}
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
        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Recruiters"
            value={totalRecruiters}
            icon={<UsersIcon className="h-6 w-6" />}
          />

          <StatCard
            label="Verified"
            value={verifiedRecruiters}
            icon={<CheckCircleIcon className="h-6 w-6" />}
          />

          <StatCard
            label="Pending"
            value={pendingRecruiters}
            icon={<ClockIcon className="h-6 w-6" />}
          />
        </section>

        {/* MAIN PANEL */}
        <section className="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                Recruiter Directory
              </p>

              <h2 className="text-xl font-black text-slate-950">
                All Recruiters
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_180px] lg:max-w-xl lg:flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search email, company, or title..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="ALL">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          {filteredRecruiters.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                  <UsersIcon className="h-8 w-8" />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  No recruiters found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Try changing your search keyword or status filter.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-hidden rounded-3xl border border-slate-200 lg:block">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                        Recruiter
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                        Company
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                        Title
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-widest text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecruiters.map((recruiter) => (
                      <tr
                        key={recruiter.id}
                        className="border-t border-slate-200 transition hover:bg-indigo-50/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar text={getRecruiterEmail(recruiter)} />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-900">
                                {getRecruiterEmail(recruiter)}
                              </p>

                              <p className="text-xs font-semibold text-slate-500">
                                ID: {recruiter.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-52 truncate text-sm font-bold text-slate-700">
                            {getRecruiterCompany(recruiter)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-52 truncate text-sm font-bold text-slate-700">
                            {getRecruiterTitle(recruiter)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge verified={recruiter.is_verified} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          {!recruiter.is_verified ? (
                            <button
                              type="button"
                              onClick={() => openVerifyModal(recruiter)}
                              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500"
                            >
                              <CheckCircleIcon className="mr-1.5 h-4 w-4" />
                              Verify
                            </button>
                          ) : (
                            <span className="text-xs font-black text-slate-400">
                              No action needed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="grid gap-3 lg:hidden">
                {filteredRecruiters.map((recruiter) => (
                  <RecruiterCard
                    key={recruiter.id}
                    recruiter={recruiter}
                    onVerify={() => openVerifyModal(recruiter)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* VERIFY MODAL */}
      {verifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
            <div className="relative bg-linear-to-br from-emerald-50 via-white to-cyan-50 px-6 py-6">
              <button
                type="button"
                onClick={closeVerifyModal}
                disabled={verifyLoading}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close verify confirmation"
              >
                <CloseIcon className="h-5 w-5" />
              </button>

              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-sm">
                <CheckCircleIcon className="h-7 w-7" />
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-widest text-emerald-600">
                Verify Recruiter
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                Approve this recruiter?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Once verified, this recruiter will be marked as approved in your platform.
              </p>
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Selected Recruiter
                </p>

                <p className="mt-1 truncate text-sm font-black text-slate-900">
                  {getRecruiterEmail(verifyTarget)}
                </p>

                <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                  {getRecruiterCompany(verifyTarget)}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeVerifyModal}
                  disabled={verifyLoading}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmVerifyRecruiter}
                  disabled={verifyLoading}
                  className="flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {verifyLoading ? (
                    <>
                      <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                      Verifying
                    </>
                  ) : (
                    'Yes, Verify'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, icon }) {
  return (
    <article className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </article>
  );
}

function RecruiterCard({ recruiter, onVerify }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <Avatar text={getRecruiterEmail(recruiter)} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-900">
            {getRecruiterEmail(recruiter)}
          </p>

          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {getRecruiterCompany(recruiter)}
          </p>
        </div>

        <StatusBadge verified={recruiter.is_verified} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MiniField label="Title" value={getRecruiterTitle(recruiter)} />
        <MiniField label="Recruiter ID" value={recruiter.id} />
      </div>

      {!recruiter.is_verified && (
        <button
          type="button"
          onClick={onVerify}
          className="mt-4 flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500"
        >
          <CheckCircleIcon className="mr-1.5 h-4 w-4" />
          Verify Recruiter
        </button>
      )}
    </article>
  );
}

function MiniField({ label, value }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-black text-slate-800">
        {value || 'Not added'}
      </p>
    </div>
  );
}

function StatusBadge({ verified }) {
  if (verified) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
        <CheckCircleIcon className="h-4 w-4" />
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
      <ClockIcon className="h-4 w-4" />
      Pending
    </span>
  );
}

function Avatar({ text }) {
  const initials = getInitials(text);

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-sm font-black text-white shadow-lg shadow-indigo-500/20">
      {initials}
    </div>
  );
}

/* ================= HELPERS ================= */

function getRecruiterEmail(recruiter) {
  return (
    recruiter?.email ||
    recruiter?.user_email ||
    recruiter?.user?.email ||
    'No email'
  );
}

function getRecruiterCompany(recruiter) {
  return (
    recruiter?.company_name ||
    recruiter?.company?.name ||
    'No company'
  );
}

function getRecruiterTitle(recruiter) {
  return recruiter?.title || 'No title';
}

function getInitials(value) {
  if (!value) return 'R';

  const clean = String(value).trim();

  if (!clean) return 'R';

  if (clean.includes('@')) {
    return clean.charAt(0).toUpperCase();
  }

  return clean
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join('');
}

/* ================= ICONS ================= */

function UsersIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19a6 6 0 0 0-12 0M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM21 19a4.5 4.5 0 0 0-6-4.2M16 3.3a4 4 0 0 1 0 7.4" />
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

function RefreshIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8 8 0 0 0-14.9-4M4 5v5h5M4 13a8 8 0 0 0 14.9 4M20 19v-5h-5" />
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

function CloseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
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