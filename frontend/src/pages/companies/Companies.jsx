import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

const emptyCompany = {
  name: '',
  description: '',
  website: '',
  location: '',
};

export default function Companies() {
  const { user } = useContext(AuthContext);

  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyCompany);

  const [pageLoading, setPageLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [verifyLoadingId, setVerifyLoadingId] = useState(null);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const canRegisterCompany = user?.role === 'RECRUITER' || user?.role === 'ADMIN';
  const canManageCompany = user?.role === 'ADMIN';

  const verifiedCount = useMemo(
    () => companies.filter((company) => company.is_verified).length,
    [companies]
  );

  const pendingCount = useMemo(
    () => companies.filter((company) => !company.is_verified).length,
    [companies]
  );

  const fetchCompanies = useCallback(async () => {
    try {
      setPageLoading(true);

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
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Company name is required.');
      return;
    }

    setRegisterLoading(true);
    const toastId = toast.loading('Registering company...');

    try {
      await api.post('/companies', {
        name: form.name.trim(),
        description: form.description.trim(),
        website: form.website.trim(),
        location: form.location.trim(),
      });

      toast.update(toastId, {
        render: 'Company registered successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      setForm(emptyCompany);
      fetchCompanies();
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Company registration failed.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleVerify = async (companyId) => {
    setVerifyLoadingId(companyId);
    const toastId = toast.loading('Verifying company...');

    try {
      await api.put(`/companies/${companyId}/verify`);

      toast.update(toastId, {
        render: 'Company verified successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      fetchCompanies();
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Verification failed.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setVerifyLoadingId(null);
    }
  };

  const openLogoUpload = (company) => {
    setSelectedCompany(company);
    setSelectedFile(null);
  };

  const closeLogoUpload = () => {
    if (uploadLoading) return;

    setSelectedCompany(null);
    setSelectedFile(null);
  };

  const handleLogoUpload = async () => {
    if (!selectedCompany?.id) return;

    if (!selectedFile) {
      toast.error('Please select a logo image.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploadLoading(true);
    const toastId = toast.loading('Uploading logo...');

    try {
      await api.post(`/companies/${selectedCompany.id}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.update(toastId, {
        render: 'Logo uploaded successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      closeLogoUpload();
      fetchCompanies();
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Logo upload failed.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setUploadLoading(false);
    }
  };

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
                  Company Center
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Company Management
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                  Register companies, verify employer profiles, and manage company logos in one clean workspace.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:min-w-96">
                <StatCard value={companies.length} label="Companies" />
                <StatCard value={verifiedCount} label="Verified" />
                <StatCard value={pendingCount} label="Pending" />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">
          {/* REGISTER FORM */}
          {canRegisterCompany && (
            <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
                  <BuildingIcon className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                    Register
                  </p>
                  <h2 className="text-xl font-black text-slate-950">
                    New Company
                  </h2>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  label="Company Name"
                  required
                  placeholder="Example: Amazon"
                  value={form.name}
                  onChange={(value) => setForm({ ...form, name: value })}
                />

                <Input
                  label="Website"
                  placeholder="https://company.com"
                  value={form.website}
                  onChange={(value) => setForm({ ...form, website: value })}
                />

                <Input
                  label="Location"
                  placeholder="Example: Bangalore"
                  value={form.location}
                  onChange={(value) => setForm({ ...form, location: value })}
                />

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Description
                  </label>

                  <textarea
                    placeholder="Write about the company, industry, hiring focus, or office details..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={registerLoading}
                  className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {registerLoading ? (
                    <>
                      <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Register Company
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </section>
          )}

          {/* COMPANY LIST */}
          <section
            className={`rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 ${
              canRegisterCompany ? '' : 'lg:col-span-2'
            }`}
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                  Directory
                </p>
                <h2 className="text-xl font-black text-slate-950">
                  All Companies
                </h2>
              </div>

              <button
                type="button"
                onClick={fetchCompanies}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>

            {pageLoading ? (
              <div className="flex min-h-80 items-center justify-center rounded-3xl bg-slate-50">
                <div className="text-center">
                  <SpinnerIcon className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                  <p className="mt-3 text-sm font-bold text-slate-500">
                    Loading companies...
                  </p>
                </div>
              </div>
            ) : companies.length === 0 ? (
              <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                    <BuildingIcon className="h-8 w-8" />
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-900">
                    No companies registered yet
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Once recruiters or admins register companies, they will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    canManageCompany={canManageCompany}
                    verifyLoadingId={verifyLoadingId}
                    onVerify={handleVerify}
                    onLogoUpload={openLogoUpload}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* LOGO UPLOAD MODAL */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
            <div className="relative bg-linear-to-br from-indigo-50 via-white to-cyan-50 px-6 py-6">
              <button
                type="button"
                onClick={closeLogoUpload}
                disabled={uploadLoading}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CloseIcon className="h-5 w-5" />
              </button>

              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600 shadow-sm">
                <ImageIcon className="h-7 w-7" />
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-widest text-indigo-600">
                Upload Logo
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                {selectedCompany.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Choose a company logo image. PNG, JPG, JPEG, or WEBP is recommended.
              </p>
            </div>

            <div className="space-y-4 px-6 pb-6">
              <label className="block cursor-pointer rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <ImageIcon className="mx-auto h-8 w-8 text-slate-400" />

                <p className="mt-2 text-sm font-black text-slate-800">
                  {selectedFile ? selectedFile.name : 'Click to choose logo'}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Image file only
                </p>
              </label>

              {selectedFile && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected logo preview"
                    className="mx-auto h-28 w-28 rounded-2xl border border-slate-200 bg-white object-contain p-2"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeLogoUpload}
                  disabled={uploadLoading}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleLogoUpload}
                  disabled={uploadLoading}
                  className="flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploadLoading ? (
                    <>
                      <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                      Uploading
                    </>
                  ) : (
                    'Upload Logo'
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

function CompanyCard({
  company,
  canManageCompany,
  verifyLoadingId,
  onVerify,
  onLogoUpload,
}) {
  const logoUrl = getLogoUrl(company.logo);

  return (
    <article className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-400">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${company.name || 'Company'} logo`}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <BuildingIcon className="h-7 w-7" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-slate-950">
                {company.name || 'Untitled Company'}
              </h3>

              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                <LocationIcon className="h-4 w-4" />
                <span className="truncate">
                  {company.location || 'Location not added'}
                </span>
              </p>
            </div>

            {company.is_verified ? (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                Verified
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black text-amber-700">
                Pending
              </span>
            )}
          </div>

          <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
            {company.description || 'No company description added.'}
          </p>

          {company.website && (
            <a
              href={safeWebsiteUrl(company.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 transition hover:text-indigo-500"
            >
              <GlobeIcon className="h-4 w-4" />
              Visit Website
            </a>
          )}
        </div>
      </div>

      {canManageCompany && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          {!company.is_verified && (
            <button
              type="button"
              onClick={() => onVerify(company.id)}
              disabled={verifyLoadingId === company.id}
              className="inline-flex items-center rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {verifyLoadingId === company.id ? (
                <>
                  <SpinnerIcon className="mr-1.5 h-4 w-4 animate-spin" />
                  Verifying
                </>
              ) : (
                <>
                  <CheckCircleIcon className="mr-1.5 h-4 w-4" />
                  Verify
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onLogoUpload(company)}
            className="inline-flex items-center rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
          >
            <ImageIcon className="mr-1.5 h-4 w-4" />
            Upload Logo
          </button>
        </div>
      )}
    </article>
  );
}

function Input({ label, value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
      />
    </div>
  );
}

function StatCard({ value, label }) {
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

function getLogoUrl(logo) {
  if (!logo) return '';

  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    return logo;
  }

  return `http://localhost:8000/${logo.replace(/^\/+/, '')}`;
}

function safeWebsiteUrl(url) {
  if (!url) return '#';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `https://${url}`;
}

/* ================= ICONS ================= */

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

function GlobeIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.4 3.4 5.4 3.4 9S14.2 18.6 12 21c-2.2-2.4-3.4-5.4-3.4-9S9.8 5.4 12 3Z" />
    </svg>
  );
}

function ImageIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4V5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 16 4.5-4.5 3.5 3.5 2-2L20 19" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 9h.01" />
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

function ArrowRightIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
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