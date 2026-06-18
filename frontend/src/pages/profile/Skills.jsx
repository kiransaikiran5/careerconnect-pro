import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const emptySkill = {
  name: '',
  category: '',
  proficiency_level: '',
};

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState(emptySkill);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(emptySkill);

  const [pageLoading, setPageLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      setPageLoading(true);

      const res = await api.get('/skills');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setSkills(list);
    } catch {
      toast.error('Failed to load skills.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!newSkill.name.trim()) {
      toast.error('Please enter skill name.');
      return;
    }

    setAddLoading(true);
    const toastId = toast.loading('Adding skill...');

    try {
      await api.post('/skills', {
        name: newSkill.name.trim(),
        category: newSkill.category.trim(),
        proficiency_level: newSkill.proficiency_level,
      });

      toast.update(toastId, {
        render: 'Skill added successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      setNewSkill(emptySkill);
      fetchSkills();
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Failed to add skill.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = (skill) => {
    setEditingId(skill.id);
    setEditData({
      name: skill.name || '',
      category: skill.category || '',
      proficiency_level: skill.proficiency_level || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(emptySkill);
  };

  const handleUpdate = async (id) => {
    if (!editData.name.trim()) {
      toast.error('Skill name is required.');
      return;
    }

    setUpdateLoading(true);
    const toastId = toast.loading('Updating skill...');

    try {
      await api.put(`/skills/${id}`, {
        name: editData.name.trim(),
        category: editData.category.trim(),
        proficiency_level: editData.proficiency_level,
      });

      toast.update(toastId, {
        render: 'Skill updated successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      setEditingId(null);
      setEditData(emptySkill);
      fetchSkills();
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Failed to update skill.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = (skill) => {
    setDeleteTarget(skill);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  const confirmDeleteSkill = async () => {
    if (!deleteTarget?.id) return;

    setDeleteLoading(true);
    const toastId = toast.loading('Deleting skill...');

    try {
      await api.delete(`/skills/${deleteTarget.id}`);

      toast.update(toastId, {
        render: 'Skill deleted successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      setDeleteTarget(null);
      fetchSkills();
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Failed to delete skill.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalSkills = skills.length;
  const advancedCount = skills.filter(
    (skill) => skill.proficiency_level === 'Advanced'
  ).length;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
          <div className="relative bg-slate-950 px-5 py-6 text-white sm:px-7">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-8 top-4 h-36 w-36 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-8 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Skills Center
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Skills Management
                  <span className="block bg-linear-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    add, update, and organize.
                  </span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Manage your technical and professional skills to improve your profile visibility.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                <StatCard value={totalSkills} label="Total Skills" />
                <StatCard value={advancedCount} label="Advanced" />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* ADD SKILL */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
                <SkillIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Add Skill
                </p>
                <h2 className="text-xl font-black text-slate-950">
                  New Skill
                </h2>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Skill name
                </label>

                <input
                  type="text"
                  placeholder="Example: React.js"
                  value={newSkill.name}
                  onChange={(e) =>
                    setNewSkill({ ...newSkill, name: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Category
                </label>

                <input
                  type="text"
                  placeholder="Example: Frontend Development"
                  value={newSkill.category}
                  onChange={(e) =>
                    setNewSkill({ ...newSkill, category: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Proficiency
                </label>

                <select
                  value={newSkill.proficiency_level}
                  onChange={(e) =>
                    setNewSkill({
                      ...newSkill,
                      proficiency_level: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="">Select proficiency</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
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
                    Add Skill
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 rounded-3xl bg-indigo-50 p-4">
              <p className="text-sm font-black text-indigo-700">
                Tip
              </p>
              <p className="mt-1 text-sm leading-6 text-indigo-600">
                Add skills like React.js, Python, SQL, FastAPI, Tailwind CSS, or SAP MM.
              </p>
            </div>
          </section>

          {/* SKILLS LIST */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                  Library
                </p>
                <h2 className="text-xl font-black text-slate-950">
                  Your Skills
                </h2>
              </div>

              <button
                type="button"
                onClick={fetchSkills}
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
                    Loading skills...
                  </p>
                </div>
              </div>
            ) : skills.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                    <SkillIcon className="h-7 w-7" />
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-900">
                    No skills added yet
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Add your first skill to strengthen your CareerConnect profile.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-130 space-y-3 overflow-y-auto pr-1">
                {skills.map((skill) => (
                  <article
                    key={skill.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70"
                  >
                    {editingId === skill.id ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <input
                            value={editData.name}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                            placeholder="Skill name"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                          />

                          <input
                            value={editData.category}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                category: e.target.value,
                              })
                            }
                            placeholder="Category"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                          />

                          <select
                            value={editData.proficiency_level}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                proficiency_level: e.target.value,
                              })
                            }
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                          >
                            <option value="">Proficiency</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(skill.id)}
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
                            onClick={cancelEdit}
                            disabled={updateLoading}
                            className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                            <SkillIcon className="h-6 w-6" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-base font-black text-slate-950">
                              {skill.name || 'Untitled Skill'}
                            </h3>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {skill.category && (
                                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">
                                  {skill.category}
                                </span>
                              )}

                              {skill.proficiency_level && (
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                                  {skill.proficiency_level}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <button
                            type="button"
                            onClick={() => handleEdit(skill)}
                            className="rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(skill)}
                            className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
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
                Delete this skill?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                This action cannot be undone. The selected skill will be permanently removed from your profile.
              </p>
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Selected Skill
                </p>

                <p className="mt-1 truncate text-sm font-black text-slate-900">
                  {deleteTarget.name || 'Untitled Skill'}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {deleteTarget.category || 'No category'}
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
                  onClick={confirmDeleteSkill}
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

function StatCard({ value, label }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-400">{label}</p>
    </div>
  );
}

/* ================= ICONS ================= */

function SkillIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4 7l8 4 8-4-8-4ZM4 11l8 4 8-4M4 15l8 4 8-4" />
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