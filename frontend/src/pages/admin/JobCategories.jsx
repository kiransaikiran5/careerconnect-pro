import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

const emptyCategory = {
  name: '',
  description: '',
};

export default function JobCategories() {
  const { user } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const fetchCategories = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshLoading(true);
      } else {
        setPageLoading(true);
      }

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
      setPageLoading(false);
      setRefreshLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return categories;

    return categories.filter((category) => {
      const name = category?.name?.toLowerCase() || '';
      const description = category?.description?.toLowerCase() || '';

      return name.includes(search) || description.includes(search);
    });
  }, [categories, searchTerm]);

  const resetForm = () => {
    setForm(emptyCategory);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setSubmitLoading(true);

    const toastId = toast.loading(
      editingId ? 'Updating category...' : 'Creating category...'
    );

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
    };

    try {
      if (editingId) {
        await api.put(`/job-categories/${editingId}`, payload);
      } else {
        await api.post('/job-categories', payload);
      }

      toast.update(toastId, {
        render: editingId
          ? 'Category updated successfully.'
          : 'Category created successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      resetForm();
      fetchCategories(true);
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Operation failed.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);

    setForm({
      name: category.name || '',
      description: category.description || '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteModal = (category) => {
    setDeleteTarget(category);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteTarget?.id) return;

    setDeleteLoading(true);
    const toastId = toast.loading('Deleting category...');

    try {
      await api.delete(`/job-categories/${deleteTarget.id}`);

      setCategories((prev) =>
        prev.filter((category) => category.id !== deleteTarget.id)
      );

      toast.update(toastId, {
        render: 'Category deleted successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      setDeleteTarget(null);

      if (editingId === deleteTarget.id) {
        resetForm();
      }
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
              Only admin users can manage job categories.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
            <div className="flex min-h-96 items-center justify-center">
              <div className="text-center">
                <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

                <h2 className="mt-4 text-xl font-black text-slate-950">
                  Loading Categories
                </h2>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Preparing job category manager...
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
                  Admin Workspace
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Job Categories
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                  Create, update, search, and organize job categories used across job postings.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-center backdrop-blur">
                <p className="text-2xl font-black leading-none text-white">
                  {categories.length}
                </p>

                <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Total Categories
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          {/* FORM */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
                  <CategoryIcon className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                    {editingId ? 'Edit Mode' : 'Create'}
                  </p>

                  <h2 className="text-xl font-black text-slate-950">
                    {editingId ? 'Update Category' : 'Add Category'}
                  </h2>
                </div>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Category Name"
                required
                placeholder="Example: Software Development"
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
              />

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Description
                </label>

                <textarea
                  placeholder="Short description about this category..."
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
                disabled={submitLoading}
                className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitLoading ? (
                  <>
                    <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                    {editingId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {editingId ? 'Update Category' : 'Add Category'}
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </section>

          {/* LIST */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                  Directory
                </p>

                <h2 className="text-xl font-black text-slate-950">
                  All Categories
                </h2>
              </div>

              <button
                type="button"
                onClick={() => fetchCategories(true)}
                disabled={refreshLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {refreshLoading ? (
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

            <div className="relative mb-4">
              <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search category name or description..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {filteredCategories.length === 0 ? (
              <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                    <CategoryIcon className="h-8 w-8" />
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-900">
                    No categories found
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Add your first job category or adjust your search keyword.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-130 space-y-3 overflow-y-auto pr-1">
                {filteredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    editingId={editingId}
                    onEdit={() => handleEdit(category)}
                    onDelete={() => openDeleteModal(category)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* DELETE MODAL */}
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
                Delete Category
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                Delete this category?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                This action cannot be undone. Make sure no job posting depends on this category.
              </p>
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Selected Category
                </p>

                <p className="mt-1 truncate text-sm font-black text-slate-900">
                  {deleteTarget.name || 'Untitled Category'}
                </p>

                <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                  {deleteTarget.description || 'No description'}
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
                  onClick={confirmDeleteCategory}
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

/* ================= COMPONENTS ================= */

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

function CategoryCard({ category, editingId, onEdit, onDelete }) {
  const isEditing = editingId === category.id;

  return (
    <article
      className={`rounded-3xl border p-4 transition ${
        isEditing
          ? 'border-indigo-300 bg-indigo-50 shadow-lg shadow-indigo-100'
          : 'border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <CategoryIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-black text-slate-950">
                {category.name || 'Untitled Category'}
              </h3>

              {isEditing && (
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-black text-indigo-700">
                  Editing
                </span>
              )}
            </div>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {category.description || 'No description added.'}
            </p>

            <p className="mt-2 text-xs font-semibold text-slate-400">
              Category ID: {category.id}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
          >
            <EditIcon className="mr-1.5 h-4 w-4" />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
          >
            <TrashIcon className="mr-1.5 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

/* ================= ICONS ================= */

function CategoryIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 0 1 6.5 4H9l2 2h6.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-10Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h8M8 15h5" />
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

function EditIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 20 4.8-1 10-10a2.2 2.2 0 0 0-3.1-3.1l-10 10L4 20Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.5 7.5 2 2" />
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

function RefreshIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8 8 0 0 0-14.9-4M4 5v5h5M4 13a8 8 0 0 0 14.9 4M20 19v-5h-5" />
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