import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

const emptyFilters = {
  q: '',
  location: '',
  job_type: '',
  min_salary: '',
  max_salary: '',
  category_id: '',
};

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

export default function JobSearch() {
  const { user } = useContext(AuthContext);

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [savedEntries, setSavedEntries] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);

  const [jobsLoading, setJobsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saveLoadingId, setSaveLoadingId] = useState(null);

  const savedJobIds = useMemo(() => {
    return savedEntries.map((entry) => String(entry.job_id || entry.job?.id));
  }, [savedEntries]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((value) => value !== '').length;
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);

      const res = await api.get('/job-categories');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setCategories(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load categories.');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await api.get('/companies');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setCompanies(list);
    } catch {
      setCompanies([]);
    }
  }, []);

  const fetchSavedJobs = useCallback(async () => {
    if (!user) {
      setSavedEntries([]);
      return;
    }

    try {
      const res = await api.get('/saved-jobs');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setSavedEntries(list);
    } catch {
      setSavedEntries([]);
    }
  }, [user]);

  const fetchJobs = useCallback(async (currentFilters = emptyFilters, showToast = false) => {
    try {
      if (showToast) {
        setSearchLoading(true);
      } else {
        setJobsLoading(true);
      }

      const params = {};

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params[key] = value;
        }
      });

      const res = await api.get('/search/jobs', { params });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setJobs(list);

      if (showToast) {
        toast.success(`${list.length} job${list.length === 1 ? '' : 's'} found.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Search failed.');
    } finally {
      setJobsLoading(false);
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchCompanies();
    fetchJobs(emptyFilters);
  }, [fetchCategories, fetchCompanies, fetchJobs]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (
      filters.min_salary &&
      filters.max_salary &&
      Number(filters.min_salary) > Number(filters.max_salary)
    ) {
      toast.error('Minimum salary cannot be greater than maximum salary.');
      return;
    }

    fetchJobs(filters, true);
  };

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    fetchJobs(emptyFilters, true);
  };

  const handleToggleSave = async (jobId) => {
    if (!user) {
      toast.error('Please login to save jobs.');
      return;
    }

    const normalizedJobId = String(jobId);
    const existingSaved = savedEntries.find(
      (entry) => String(entry.job_id || entry.job?.id) === normalizedJobId
    );

    try {
      setSaveLoadingId(jobId);

      if (existingSaved) {
        await api.delete(`/saved-jobs/${existingSaved.id}`);

        setSavedEntries((prev) =>
          prev.filter((entry) => String(entry.id) !== String(existingSaved.id))
        );

        toast.success('Job removed from saved jobs.');
      } else {
        const res = await api.post(`/saved-jobs/${jobId}`);

        const savedData = res.data?.id
          ? res.data
          : {
              id: `${jobId}-${Date.now()}`,
              job_id: jobId,
            };

        setSavedEntries((prev) => [...prev, savedData]);

        toast.success('Job saved successfully.');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update saved job.');
      fetchSavedJobs();
    } finally {
      setSaveLoadingId(null);
    }
  };

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
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Job Search
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Find Your Dream Job
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Search jobs by title, location, type, salary range, and category.
                  Save jobs, view details, or apply directly from the job card.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:min-w-96">
                <HeaderStat value={jobs.length} label="Jobs Found" />
                <HeaderStat value={activeFilterCount} label="Filters" />
                <HeaderStat value={savedJobIds.length} label="Saved" />
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH PANEL */}
        <section className="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
              <SearchIcon className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                Filters
              </p>

              <h2 className="text-xl font-black text-slate-950">
                Search Jobs
              </h2>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Input
                label="Keyword"
                name="q"
                value={filters.q}
                onChange={handleChange}
                placeholder="Job title or keyword"
                icon={<SearchIcon className="h-5 w-5" />}
              />

              <Input
                label="Location"
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="City or region"
                icon={<LocationIcon className="h-5 w-5" />}
              />

              <Select
                label="Job Type"
                name="job_type"
                value={filters.job_type}
                onChange={handleChange}
                icon={<BriefcaseIcon className="h-5 w-5" />}
              >
                <option value="">All Types</option>

                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>

              <Select
                label="Category"
                name="category_id"
                value={filters.category_id}
                onChange={handleChange}
                icon={<CategoryIcon className="h-5 w-5" />}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'All Categories'}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              <Input
                type="number"
                label="Min Salary"
                name="min_salary"
                value={filters.min_salary}
                onChange={handleChange}
                placeholder="Example: 300000"
                icon={<CurrencyIcon className="h-5 w-5" />}
              />

              <Input
                type="number"
                label="Max Salary"
                name="max_salary"
                value={filters.max_salary}
                onChange={handleChange}
                placeholder="Example: 900000"
                icon={<CurrencyIcon className="h-5 w-5" />}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={searchLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {searchLoading ? (
                  <>
                    <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    Search Jobs
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={clearFilters}
                disabled={searchLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <CloseIcon className="mr-2 h-5 w-5" />
                Clear Filters
              </button>
            </div>
          </form>
        </section>

        {/* RESULTS */}
        <section className="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Results
              </p>

              <h2 className="text-xl font-black text-slate-950">
                Available Jobs
              </h2>
            </div>

            <button
              type="button"
              onClick={() => fetchJobs(filters, true)}
              disabled={searchLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {searchLoading ? (
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

          {jobsLoading ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl bg-slate-50">
              <div className="text-center">
                <SpinnerIcon className="mx-auto h-9 w-9 animate-spin text-indigo-600" />

                <p className="mt-3 text-sm font-bold text-slate-500">
                  Loading jobs...
                </p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                  <BriefcaseIcon className="h-8 w-8" />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  No jobs found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Try changing keyword, salary range, location, or category filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  companies={companies}
                  isSaved={savedJobIds.includes(String(job.id))}
                  saveLoading={String(saveLoadingId) === String(job.id)}
                  onToggleSave={handleToggleSave}
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

function JobCard({
  job,
  companies,
  isSaved,
  saveLoading,
  onToggleSave,
}) {
  const companyName = getCompanyName(job, companies);

  return (
    <article className="group relative rounded-4xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/70">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleSave(job.id);
        }}
        disabled={saveLoading}
        title={isSaved ? 'Unsave job' : 'Save job'}
        className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-2xl border text-lg font-black shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
          isSaved
            ? 'border-amber-200 bg-amber-50 text-amber-500 hover:bg-amber-100'
            : 'border-slate-200 bg-white text-slate-400 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-500'
        }`}
      >
        {saveLoading ? (
          <SpinnerIcon className="h-5 w-5 animate-spin" />
        ) : isSaved ? (
          '★'
        ) : (
          '☆'
        )}
      </button>

      <div className="flex items-start justify-between gap-3 pr-10">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <BriefcaseIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-black leading-snug text-slate-950 group-hover:text-indigo-700">
              {job.title || 'Untitled Job'}
            </h3>

            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-slate-500">
              <BuildingIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{companyName}</span>
            </p>
          </div>
        </div>

        <span className="hidden shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700 sm:inline-flex">
          Open
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.location && (
          <Badge icon={<LocationIcon className="h-4 w-4" />}>
            {job.location}
          </Badge>
        )}

        {job.job_type && (
          <Badge icon={<BriefcaseIcon className="h-4 w-4" />}>
            {job.job_type}
          </Badge>
        )}

        <Badge icon={<CurrencyIcon className="h-4 w-4" />}>
          {formatSalary(job.salary_min, job.salary_max)}
        </Badge>
      </div>

      {job.description && (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {truncateText(job.description, 120)}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4">
        <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <CalendarIcon className="h-4 w-4" />
          Posted {formatDate(job.created_at)}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-xs font-black text-indigo-700 shadow-sm transition hover:bg-indigo-50"
          >
            View Details
          </Link>

          <Link
            to={`/apply/${job.id}`}
            className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-indigo-500/35"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </article>
  );
}

function Badge({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm">
      {icon}
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

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  type = 'text',
}) {
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
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  icon,
  children,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {children}
        </select>

        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function getCompanyName(job, companies = []) {
  const directName =
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
    job?.employer_name;

  if (directName) return directName;

  const companyId =
    job?.company_id ||
    job?.company?.id ||
    job?.recruiter?.company_id ||
    job?.recruiter?.company?.id;

  if (companyId) {
    const matchedCompany = companies.find(
      (company) => String(company.id) === String(companyId)
    );

    if (matchedCompany) {
      return (
        matchedCompany.name ||
        matchedCompany.company_name ||
        matchedCompany.business_name ||
        matchedCompany.organization_name ||
        'Company not added'
      );
    }
  }

  return 'Company not added';
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
  if (!dateValue) return 'recently';

  return new Date(dateValue).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function truncateText(text, maxLength) {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
}

/* ================= ICONS ================= */

function BriefcaseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h14" />
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

function LocationIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5h.01" />
    </svg>
  );
}

function CategoryIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 0 1 6.5 4H9l2 2h6.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-10Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h8M8 15h5" />
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

function BuildingIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1" />
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

function ChevronDownIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
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

function CloseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
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