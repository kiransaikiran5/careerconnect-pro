import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

const emptyJob = {
  title: '',
  description: '',
  requirements: '',
  location: '',
  salary_min: '',
  salary_max: '',
  job_type: 'Full-time',
  category_id: '',
  is_active: false,
};

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];

export default function ManageJobs() {
  const { user } = useContext(AuthContext);

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(emptyJob);

  const [editingJob, setEditingJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [jobsLoading, setJobsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const role = String(user?.role || '').toUpperCase();
  const isRecruiter = role === 'RECRUITER';
  const isAdmin = role === 'ADMIN';

  const stats = useMemo(() => {
    const published = jobs.filter((job) => job.is_active).length;
    const drafts = jobs.length - published;

    return {
      total: jobs.length,
      published,
      drafts,
    };
  }, [jobs]);

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

  const fetchJobs = useCallback(async () => {
    try {
      setJobsLoading(true);

      const res = await api.get('/jobs', {
        params: {
          show_drafts: true,
        },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setJobs(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load jobs.');
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchJobs();
  }, [fetchCategories, fetchJobs]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyJob);
    setEditingJob(null);
  };

  const handleEdit = (job) => {
    setEditingJob(job);

    setFormData({
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      location: job.location || '',
      salary_min: job.salary_min ?? '',
      salary_max: job.salary_max ?? '',
      job_type: job.job_type || 'Full-time',
      category_id: job.category_id || job.category?.id || '',
      is_active: Boolean(job.is_active),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Job title is required.');
      return false;
    }

    if (!formData.location.trim()) {
      toast.error('Location is required.');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Job description is required.');
      return false;
    }

    if (
      formData.salary_min &&
      formData.salary_max &&
      Number(formData.salary_min) > Number(formData.salary_max)
    ) {
      toast.error('Minimum salary cannot be greater than maximum salary.');
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    title: formData.title.trim(),
    description: formData.description.trim(),
    requirements: formData.requirements.trim(),
    location: formData.location.trim(),
    salary_min: formData.salary_min === '' ? null : Number(formData.salary_min),
    salary_max: formData.salary_max === '' ? null : Number(formData.salary_max),
    job_type: formData.job_type,
    category_id: formData.category_id === '' ? null : Number(formData.category_id),
    is_active: Boolean(formData.is_active),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = buildPayload();

      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}`, payload);
        toast.success('Job updated successfully.');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job created successfully.');
      }

      resetForm();
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save job.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async (job) => {
    const nextPublishState = !job.is_active;

    try {
      setActionLoadingId(`publish-${job.id}`);

      await api.put(`/jobs/${job.id}/publish`, null, {
        params: {
          publish: nextPublishState,
        },
      });

      toast.success(nextPublishState ? 'Job published.' : 'Job moved to draft.');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update job status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoadingId(`delete-${deleteTarget.id}`);

      await api.delete(`/jobs/${deleteTarget.id}`);

      toast.success('Job deleted successfully.');
      setDeleteTarget(null);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete job.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (user && !isRecruiter && !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-5">
        <div className="mx-auto max-w-3xl rounded-4xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
            <LockIcon className="h-8 w-8" />
          </div>

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Access Denied
          </h1>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            Only recruiters and admins can manage jobs.
          </p>

          <Link
            to="/jobs"
            className="mt-5 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-500"
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
                  {isAdmin ? 'Admin Job Control' : 'Recruiter Workspace'}
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Manage Jobs
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                  Create, publish, edit jobs, and open candidate applications for each posting.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:min-w-96">
                <HeaderStat value={stats.total} label="Total" />
                <HeaderStat value={stats.published} label="Published" />
                <HeaderStat value={stats.drafts} label="Drafts" />
              </div>
            </div>
          </div>
        </section>

        {/* FORM */}
        <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                {editingJob ? 'Update Job' : 'Create Job'}
              </p>

              <h2 className="text-xl font-black text-slate-950">
                {editingJob ? 'Edit Job Posting' : 'Post a New Job'}
              </h2>
            </div>

            {editingJob && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <Input
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Frontend Developer"
              />

              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Example: Bangalore, India"
              />

              <Select
                label="Job Type"
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
              >
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>

              <Select
                label="Category"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              <Input
                type="number"
                label="Minimum Salary"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleChange}
                placeholder="Example: 300000"
              />

              <Input
                type="number"
                label="Maximum Salary"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleChange}
                placeholder="Example: 900000"
              />
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <Textarea
                label="Job Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write role summary, responsibilities, and expectations..."
              />

              <Textarea
                label="Requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Example: React, JavaScript, REST API, Git..."
              />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex cursor-pointer items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 lg:min-w-96">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />

                <div>
                  <p className="text-sm font-black text-slate-800">
                    Publish this job
                  </p>

                  <p className="text-xs font-semibold text-slate-500">
                    If unchecked, job will be saved as draft.
                  </p>
                </div>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : editingJob ? (
                  'Update Job'
                ) : (
                  'Create Job'
                )}
              </button>
            </div>
          </form>
        </section>

        {/* JOB LIST */}
        <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Listings
              </p>

              <h2 className="text-xl font-black text-slate-950">
                Posted Jobs
              </h2>
            </div>

            <button
              type="button"
              onClick={fetchJobs}
              disabled={jobsLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {jobsLoading ? (
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
            <div className="flex min-h-80 items-center justify-center rounded-3xl bg-slate-50">
              <div className="text-center">
                <SpinnerIcon className="mx-auto h-9 w-9 animate-spin text-indigo-600" />

                <p className="mt-3 text-sm font-bold text-slate-500">
                  Loading jobs...
                </p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                  <BriefcaseIcon className="h-8 w-8" />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  No jobs posted yet
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Create your first job posting using the form above.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  actionLoadingId={actionLoadingId}
                  onEdit={handleEdit}
                  onPublishToggle={handlePublishToggle}
                  onDeleteClick={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {deleteTarget && (
        <DeleteModal
          job={deleteTarget}
          loading={actionLoadingId === `delete-${deleteTarget.id}`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function JobCard({ job, actionLoadingId, onEdit, onPublishToggle, onDeleteClick }) {
  const publishLoading = actionLoadingId === `publish-${job.id}`;

  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-slate-950">
              {job.title || 'Untitled Job'}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                job.is_active
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {job.is_active ? 'Published' : 'Draft'}
            </span>
          </div>

          <p className="mt-1 text-sm font-bold text-slate-500">
            {job.location || 'Location not added'} • {job.job_type || 'Job type not added'} •{' '}
            {formatSalary(job.salary_min, job.salary_max)}
          </p>

          {job.description && (
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              {truncateText(job.description, 140)}
            </p>
          )}

          <p className="mt-2 text-xs font-semibold text-slate-400">
            Posted {formatDate(job.created_at)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
          <Link
            to={`/candidates/${job.id}`}
            className="inline-flex items-center justify-center rounded-2xl bg-purple-50 px-4 py-2 text-xs font-black text-purple-700 transition hover:bg-purple-100"
          >
            Candidates
          </Link>

          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
          >
            View
          </Link>

          <button
            type="button"
            onClick={() => onEdit(job)}
            className="inline-flex items-center justify-center rounded-2xl bg-amber-50 px-4 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-100"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onPublishToggle(job)}
            disabled={publishLoading}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {publishLoading ? (
              <>
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : job.is_active ? (
              'Unpublish'
            ) : (
              'Publish'
            )}
          </button>

          <button
            type="button"
            onClick={() => onDeleteClick(job)}
            className="inline-flex items-center justify-center rounded-2xl bg-red-50 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function DeleteModal({ job, loading, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-4xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-red-50 text-red-600">
          <TrashIcon className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-center text-xl font-black text-slate-950">
          Delete Job?
        </h3>

        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          Are you sure you want to delete{' '}
          <span className="font-black text-slate-800">{job.title}</span>?
          This action cannot be undone.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, children, disabled = false }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {children}
      </select>
    </div>
  );
}

function Textarea({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
      />
    </div>
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

function RefreshIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8 8 0 0 0-14.9-4M4 5v5h5M4 13a8 8 0 0 0 14.9 4M20 19v-5h-5" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M10 11v6M14 11v6M9 7V5h6v2M8 7l1 14h6l1-14" />
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