// src/pages/recruiter/Interviews.jsx
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

const emptyForm = {
  application_id: '',
  scheduled_at: '',
  location: '',
  notes: '',
};

const emptyEditForm = {
  scheduled_at: '',
  location: '',
  notes: '',
  feedback: '',
  status: 'Scheduled',
};

const interviewStatuses = ['Scheduled', 'Completed', 'Cancelled'];

const statusStyles = {
  Scheduled: 'border-blue-200 bg-blue-50 text-blue-700',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Cancelled: 'border-red-200 bg-red-50 text-red-700',
};

export default function Interviews() {
  const { user } = useContext(AuthContext);

  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);

  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [updating, setUpdating] = useState(false);

  const role = String(user?.role || '').toUpperCase();
  const isRecruiter = role === 'RECRUITER';
  const isAdmin = role === 'ADMIN';

  const stats = useMemo(() => {
    return {
      total: interviews.length,
      scheduled: interviews.filter((item) => item.status === 'Scheduled').length,
      completed: interviews.filter((item) => item.status === 'Completed').length,
    };
  }, [interviews]);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get('/interviews/recruiter');

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

  const fetchApplications = useCallback(async () => {
    try {
      setApplicationsLoading(true);

      const jobsRes = await api.get('/jobs', {
        params: {
          show_drafts: true,
        },
      });

      const jobsList = Array.isArray(jobsRes.data)
        ? jobsRes.data
        : Array.isArray(jobsRes.data?.data)
          ? jobsRes.data.data
          : [];

      const validJobs = jobsList.filter((job) => job?.id);

      if (validJobs.length === 0) {
        setApplications([]);
        return;
      }

      const applicantRequests = validJobs.map(async (job) => {
        try {
          const res = await api.get(`/shortlisting/jobs/${job.id}/applications`);

          const apps = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : [];

          return apps.map((app) => ({
            ...app,
            job_id: app.job_id || job.id,
            job_title: app.job_title || job.title || `Job #${job.id}`,
          }));
        } catch {
          return [];
        }
      });

      const nestedApplicants = await Promise.all(applicantRequests);
      const allApplicants = nestedApplicants.flat();

      const allowedApplicants = allApplicants.filter((app) =>
        ['APPLIED', 'SHORTLISTED'].includes(String(app.status || '').toUpperCase())
      );

      const uniqueApplicants = Array.from(
        new Map(
          allowedApplicants.map((app) => [
            String(getApplicationId(app)),
            app,
          ])
        ).values()
      );

      setApplications(uniqueApplicants);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load applicants.');
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
    fetchApplications();
  }, [fetchInterviews, fetchApplications]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSchedule = async (e) => {
    e.preventDefault();

    if (!form.application_id) {
      toast.error('Please select an applicant.');
      return;
    }

    if (!form.scheduled_at) {
      toast.error('Please select interview date and time.');
      return;
    }

    try {
      setScheduling(true);

      const payload = {
        application_id: Number(form.application_id),
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        location: form.location.trim(),
        notes: form.notes.trim(),
      };

      await api.post('/interviews', payload);

      toast.success('Interview scheduled successfully.');
      setForm(emptyForm);

      await fetchInterviews();
      await fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  const handleEdit = (interview) => {
    setEditingId(interview.id);

    setEditForm({
      scheduled_at: toDateTimeLocal(interview.scheduled_at),
      location: interview.location || '',
      notes: interview.notes || '',
      feedback: interview.feedback || '',
      status: interview.status || 'Scheduled',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyEditForm);
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    if (!editForm.scheduled_at) {
      toast.error('Interview date and time is required.');
      return;
    }

    try {
      setUpdating(true);

      const payload = {
        scheduled_at: new Date(editForm.scheduled_at).toISOString(),
        location: editForm.location.trim(),
        notes: editForm.notes.trim(),
        feedback: editForm.feedback.trim(),
        status: editForm.status,
      };

      await api.put(`/interviews/${editingId}`, payload);

      toast.success('Interview updated successfully.');
      cancelEdit();
      await fetchInterviews();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed.');
    } finally {
      setUpdating(false);
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
            Only recruiters and admins can manage interviews.
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
                  Interview Desk
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Interview Management
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                  Schedule interviews from applied or shortlisted candidates.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:min-w-96">
                <HeaderStat value={stats.total} label="Total" />
                <HeaderStat value={stats.scheduled} label="Scheduled" />
                <HeaderStat value={stats.completed} label="Completed" />
              </div>
            </div>
          </div>
        </section>

        {/* SCHEDULE FORM */}
        <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                Schedule
              </p>

              <h2 className="text-xl font-black text-slate-950">
                Schedule Interview
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Applicants shown here are loaded from candidate shortlisting.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                fetchInterviews();
                fetchApplications();
              }}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200"
            >
              <RefreshIcon className="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>

          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <Select
                label="Select Applicant"
                name="application_id"
                value={form.application_id}
                onChange={handleFormChange}
                disabled={applicationsLoading}
              >
                <option value="">
                  {applicationsLoading
                    ? 'Loading applicants...'
                    : applications.length === 0
                      ? 'No applied or shortlisted applicants found'
                      : 'Select applicant'}
                </option>

                {applications.map((app) => (
                  <option key={getApplicationId(app)} value={getApplicationId(app)}>
                    {getApplicantName(app)} | {app.job_title || getJobTitle(app)} | {formatStatus(app.status)}
                  </option>
                ))}
              </Select>

              <Input
                type="datetime-local"
                label="Interview Date & Time"
                name="scheduled_at"
                value={form.scheduled_at}
                onChange={handleFormChange}
              />

              <Input
                label="Location / Video Link"
                name="location"
                value={form.location}
                onChange={handleFormChange}
                placeholder="Example: Google Meet / Zoom link / Office room"
              />

              <Textarea
                label="Notes for Candidate"
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                placeholder="Example: Please join 5 minutes early with your resume."
                rows={2}
              />
            </div>

            {applications.length === 0 && !applicationsLoading && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                No applicants are available for scheduling. First make sure the candidate has applied to a job and status is Applied or Shortlisted.
              </div>
            )}

            <button
              type="submit"
              disabled={scheduling || applicationsLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {scheduling ? (
                <>
                  <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule Interview'
              )}
            </button>
          </form>
        </section>

        {/* INTERVIEW LIST */}
        <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
              Interviews
            </p>

            <h2 className="text-xl font-black text-slate-950">
              Scheduled Interviews
            </h2>
          </div>

          {loading ? (
            <div className="flex min-h-80 items-center justify-center rounded-3xl bg-slate-50">
              <div className="text-center">
                <SpinnerIcon className="mx-auto h-9 w-9 animate-spin text-indigo-600" />

                <p className="mt-3 text-sm font-bold text-slate-500">
                  Loading interviews...
                </p>
              </div>
            </div>
          ) : interviews.length === 0 ? (
            <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                  <CalendarIcon className="h-8 w-8" />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  No interviews scheduled
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Select an applicant above and schedule your first interview.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  editingId={editingId}
                  editForm={editForm}
                  updating={updating}
                  onEdit={handleEdit}
                  onCancel={cancelEdit}
                  onUpdate={handleUpdate}
                  onEditFormChange={handleEditFormChange}
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

function InterviewCard({
  interview,
  editingId,
  editForm,
  updating,
  onEdit,
  onCancel,
  onUpdate,
  onEditFormChange,
}) {
  const isEditing = editingId === interview.id;

  if (isEditing) {
    return (
      <article className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-4">
        <div className="grid gap-3 lg:grid-cols-2">
          <Input
            type="datetime-local"
            label="Date & Time"
            name="scheduled_at"
            value={editForm.scheduled_at}
            onChange={onEditFormChange}
          />

          <Input
            label="Location"
            name="location"
            value={editForm.location}
            onChange={onEditFormChange}
            placeholder="Location / video link"
          />

          <Textarea
            label="Notes"
            name="notes"
            value={editForm.notes}
            onChange={onEditFormChange}
            placeholder="Notes for candidate"
            rows={2}
          />

          <Textarea
            label="Feedback"
            name="feedback"
            value={editForm.feedback}
            onChange={onEditFormChange}
            placeholder="Recruiter feedback"
            rows={2}
          />

          <Select
            label="Status"
            name="status"
            value={editForm.status}
            onChange={onEditFormChange}
          >
            {interviewStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={onUpdate}
              disabled={updating}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {updating ? (
                <>
                  <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                  Saving
                </>
              ) : (
                'Save Changes'
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={updating}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <CalendarIcon className="h-6 w-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-slate-950">
                {getApplicantName(interview)}
              </h3>

              <StatusBadge status={interview.status || 'Scheduled'} />
            </div>

            <p className="mt-1 text-sm font-bold text-slate-500">
              {getJobTitle(interview)}
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              {formatDateTime(interview.scheduled_at)} @{' '}
              {interview.location || 'TBD'}
            </p>

            {interview.notes && (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                <span className="font-black text-slate-800">Notes:</span>{' '}
                {interview.notes}
              </p>
            )}

            {interview.feedback && (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                <span className="font-black text-slate-800">Feedback:</span>{' '}
                {interview.feedback}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onEdit(interview)}
          className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
        >
          Edit
        </button>
      </div>
    </article>
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

function Textarea({ label, name, value, onChange, placeholder, rows = 3 }) {
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
        rows={rows}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
      />
    </div>
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

function getApplicationId(app) {
  return app?.application_id || app?.id || '';
}

function getApplicantName(item) {
  return (
    item?.applicant_name ||
    item?.candidate_name ||
    item?.user?.name ||
    item?.applicant?.name ||
    item?.applicant_email ||
    item?.candidate_email ||
    'Candidate'
  );
}

function getJobTitle(item) {
  return item?.job_title || item?.job?.title || `Job #${item?.job_id || ''}`;
}

function formatStatus(status) {
  if (!status) return 'Unknown';

  return String(status)
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toDateTimeLocal(dateValue) {
  if (!dateValue) return '';

  const date = new Date(dateValue);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
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