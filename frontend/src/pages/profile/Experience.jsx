import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const emptyExperience = {
  company_name: '',
  position: '',
  start_date: '',
  end_date: '',
  description: '',
  is_current: false,
};

export default function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [form, setForm] = useState(emptyExperience);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(emptyExperience);

  const [pageLoading, setPageLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchExperiences = useCallback(async () => {
    try {
      setPageLoading(true);

      const res = await api.get('/experience');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setExperiences(list);
    } catch {
      toast.error('Failed to load work experience.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const resetForm = () => {
    setForm(emptyExperience);
  };

  const preparePayload = (data) => ({
    company_name: data.company_name.trim(),
    position: data.position.trim(),
    description: data.description.trim(),
    is_current: Boolean(data.is_current),
    start_date: data.start_date ? new Date(data.start_date).toISOString() : null,
    end_date: data.is_current
      ? null
      : data.end_date
        ? new Date(data.end_date).toISOString()
        : null,
  });

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!form.company_name.trim() || !form.position.trim()) {
      toast.error('Company name and position are required.');
      return;
    }

    setAddLoading(true);
    const toastId = toast.loading('Adding experience...');

    try {
      await api.post('/experience', preparePayload(form));

      toast.update(toastId, {
        render: 'Experience added successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      resetForm();
      fetchExperiences();
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Failed to add experience.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = (experience) => {
    setEditingId(experience.id);
    setEditData({
      company_name: experience.company_name || '',
      position: experience.position || '',
      start_date: toInputDate(experience.start_date),
      end_date: toInputDate(experience.end_date),
      description: experience.description || '',
      is_current: Boolean(experience.is_current),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(emptyExperience);
  };

  const handleUpdate = async (id) => {
    if (!editData.company_name.trim() || !editData.position.trim()) {
      toast.error('Company name and position are required.');
      return;
    }

    setUpdateLoading(true);
    const toastId = toast.loading('Updating experience...');

    try {
      await api.put(`/experience/${id}`, preparePayload(editData));

      toast.update(toastId, {
        render: 'Experience updated successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      setEditingId(null);
      setEditData(emptyExperience);
      fetchExperiences();
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Update failed.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = (experience) => {
    setDeleteTarget(experience);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  const confirmDeleteExperience = async () => {
    if (!deleteTarget?.id) return;

    setDeleteLoading(true);
    const toastId = toast.loading('Deleting experience...');

    try {
      await api.delete(`/experience/${deleteTarget.id}`);

      toast.update(toastId, {
        render: 'Experience deleted successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      setDeleteTarget(null);
      fetchExperiences();
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Delete failed.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalExperiences = experiences.length;
  const currentCount = experiences.filter((item) => item.is_current).length;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* COMPACT HEADER */}
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="relative bg-slate-950 px-5 py-4 text-white sm:px-6">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-8 top-2 h-24 w-24 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-8 h-28 w-28 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Experience Center
                </div>

                <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                  Work Experience
                  <span className="ml-2 bg-linear-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    Manager
                  </span>
                </h1>

                <p className="mt-1 max-w-xl text-xs leading-5 text-slate-300 sm:text-sm">
                  Add company, role, duration, and responsibilities in one clean place.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:min-w-56">
                <StatCard value={totalExperiences} label="Total Entries" />
                <StatCard value={currentCount} label="Current Roles" />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          {/* ADD FORM */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
                <WorkIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Add Experience
                </p>
                <h2 className="text-xl font-black text-slate-950">
                  New Work Entry
                </h2>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Company Name
                  </label>

                  <input
                    type="text"
                    placeholder="Example: Amazon"
                    value={form.company_name}
                    onChange={(e) =>
                      setForm({ ...form, company_name: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Position
                  </label>

                  <input
                    type="text"
                    placeholder="Example: Junior SAP Consultant"
                    value={form.position}
                    onChange={(e) =>
                      setForm({ ...form, position: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                {!form.is_current && (
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">
                      End Date
                    </label>

                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) =>
                        setForm({ ...form, end_date: e.target.value })
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-black text-slate-800">
                    Currently working here
                  </p>
                  <p className="text-xs text-slate-500">
                    End date will be marked as Present.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.is_current}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_current: e.target.checked,
                      end_date: e.target.checked ? '' : form.end_date,
                    })
                  }
                  className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Description / Responsibilities
                </label>

                <textarea
                  placeholder="Write your responsibilities, achievements, tools used, or project work..."
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
                disabled={addLoading}
                className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {addLoading ? (
                  <>
                    <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    Add Experience
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </section>

          {/* EXPERIENCE LIST */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                  Library
                </p>
                <h2 className="text-xl font-black text-slate-950">
                  Your Experience
                </h2>
              </div>

              <button
                type="button"
                onClick={fetchExperiences}
                className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>

            {pageLoading ? (
              <div className="flex min-h-64 items-center justify-center rounded-3xl bg-slate-50">
                <div className="text-center">
                  <SpinnerIcon className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                  <p className="mt-3 text-sm font-bold text-slate-500">
                    Loading work experience...
                  </p>
                </div>
              </div>
            ) : experiences.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                    <WorkIcon className="h-7 w-7" />
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-900">
                    No work experience added yet
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Add your first experience entry to complete your profile.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-130 space-y-3 overflow-y-auto pr-1">
                {experiences.map((experience) => (
                  <article
                    key={experience.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70"
                  >
                    {editingId === experience.id ? (
                      <EditExperienceForm
                        editData={editData}
                        setEditData={setEditData}
                        updateLoading={updateLoading}
                        onSave={() => handleUpdate(experience.id)}
                        onCancel={cancelEdit}
                      />
                    ) : (
                      <DisplayExperience
                        experience={experience}
                        onEdit={() => handleEdit(experience)}
                        onDelete={() => handleDelete(experience)}
                      />
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
            <div className="relative bg-linear-to-br from-red-50 via-white to-orange-50 px-6 py-6">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close delete confirmation"
              >
                <CloseIcon className="h-5 w-5" />
              </button>

              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-red-100 text-red-600 shadow-sm">
                <TrashIcon className="h-7 w-7" />
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-widest text-red-600">
                Delete Confirmation
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                Delete this experience?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                This action cannot be undone. The selected work experience will be permanently removed.
              </p>
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Selected Experience
                </p>

                <p className="mt-1 truncate text-sm font-black text-slate-900">
                  {deleteTarget.position || 'Untitled Role'}
                </p>

                <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                  {deleteTarget.company_name || 'No company'}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteExperience}
                  disabled={deleteLoading}
                  className="flex items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-500/25 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteLoading ? (
                    <>
                      <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                      Deleting
                    </>
                  ) : (
                    'Yes, Delete'
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

/* ================= SMALL COMPONENTS ================= */

function EditExperienceForm({
  editData,
  setEditData,
  updateLoading,
  onSave,
  onCancel,
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          value={editData.company_name}
          onChange={(value) =>
            setEditData({ ...editData, company_name: value })
          }
          placeholder="Company Name"
        />

        <Input
          value={editData.position}
          onChange={(value) => setEditData({ ...editData, position: value })}
          placeholder="Position"
        />

        <input
          type="date"
          value={editData.start_date}
          onChange={(e) =>
            setEditData({ ...editData, start_date: e.target.value })
          }
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        />

        {!editData.is_current && (
          <input
            type="date"
            value={editData.end_date}
            onChange={(e) =>
              setEditData({ ...editData, end_date: e.target.value })
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        )}
      </div>

      <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700">
        <input
          type="checkbox"
          checked={Boolean(editData.is_current)}
          onChange={(e) =>
            setEditData({
              ...editData,
              is_current: e.target.checked,
              end_date: e.target.checked ? '' : editData.end_date,
            })
          }
          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Currently working here
      </label>

      <textarea
        value={editData.description}
        onChange={(e) =>
          setEditData({ ...editData, description: e.target.value })
        }
        placeholder="Description / Responsibilities"
        rows={3}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={updateLoading}
          className="flex items-center rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {updateLoading ? (
            <>
              <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            'Save Changes'
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={updateLoading}
          className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function DisplayExperience({ experience, onEdit, onDelete }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
          <WorkIcon className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-black text-slate-950">
              {experience.position || 'Untitled Role'}
            </h3>

            {experience.is_current && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                Current
              </span>
            )}
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            {experience.company_name || 'No company name'}
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            {formatDate(experience.start_date) || 'Start not set'} -{' '}
            {experience.is_current
              ? 'Present'
              : formatDate(experience.end_date) || 'End not set'}
          </p>

          {experience.description && (
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {experience.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
    />
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-center backdrop-blur">
      <p className="text-xl font-black leading-none text-white">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* ================= HELPERS ================= */

function toInputDate(dateValue) {
  if (!dateValue) return '';
  return String(dateValue).slice(0, 10);
}

function formatDate(dateValue) {
  if (!dateValue) return '';

  return new Date(dateValue).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/* ================= ICONS ================= */

function WorkIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h14" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />
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

function CloseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}