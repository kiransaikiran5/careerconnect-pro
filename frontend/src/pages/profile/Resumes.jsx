import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

export default function Resumes() {
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchResumes = useCallback(async () => {
    try {
      setPageLoading(true);

      const res = await api.get('/resumes');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setResumes(list);
    } catch {
      toast.error('Failed to load resumes.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  useEffect(() => {
    return () => {
      if (preview?.url) {
        window.URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter resume title.');
      return;
    }

    if (!file) {
      toast.error('Please select a file.');
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['pdf', 'doc', 'docx', 'txt'];

    if (!allowedTypes.includes(extension)) {
      toast.error('Only PDF, DOC, DOCX, and TXT files are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('is_current', String(isCurrent));
    formData.append('file', file);

    setLoading(true);
    const toastId = toast.loading('Uploading resume...');

    try {
      await api.post('/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.update(toastId, {
        render: 'Resume uploaded successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1800,
      });

      setTitle('');
      setFile(null);
      setIsCurrent(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      fetchResumes();
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Upload failed. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (resume) => {
    const toastId = toast.loading('Opening preview...');

    try {
      let response;

      try {
        response = await api.get(`/resumes/${resume.id}/preview`, {
          responseType: 'blob',
        });
      } catch {
        response = await api.get(`/resumes/${resume.id}/download`, {
          responseType: 'blob',
        });
      }

      const blob = new Blob([response.data], {
        type: response.headers?.['content-type'] || 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);

      if (preview?.url) {
        window.URL.revokeObjectURL(preview.url);
      }

      setPreview({
        url,
        title: resume.title || 'Resume Preview',
        type: blob.type,
        filename: getDownloadName(resume),
      });

      toast.update(toastId, {
        render: 'Preview opened.',
        type: 'success',
        isLoading: false,
        autoClose: 1200,
      });
    } catch {
      toast.update(toastId, {
        render: 'Preview failed. Please download the file.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    }
  };

  const closePreview = () => {
    if (preview?.url) {
      window.URL.revokeObjectURL(preview.url);
    }

    setPreview(null);
  };

  const handleDownload = async (resumeId, filename) => {
    const toastId = toast.loading('Preparing download...');

    try {
      const response = await api.get(`/resumes/${resumeId}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', filename || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.update(toastId, {
        render: 'Resume downloaded.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });
    } catch {
      toast.update(toastId, {
        render: 'Download failed.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    }
  };

  const handleDelete = (resume) => {
    setDeleteTarget(resume);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  const confirmDeleteResume = async () => {
    if (!deleteTarget?.id) return;

    setDeleteLoading(true);
    const toastId = toast.loading('Deleting resume...');

    try {
      await api.delete(`/resumes/${deleteTarget.id}`);

      toast.update(toastId, {
        render: 'Resume deleted successfully.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      setDeleteTarget(null);
      fetchResumes();
    } catch {
      toast.update(toastId, {
        render: 'Delete failed. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSetCurrent = async (resumeId) => {
    const toastId = toast.loading('Updating current resume...');

    try {
      await api.put(`/resumes/${resumeId}/set-current`);

      toast.update(toastId, {
        render: 'Current resume updated.',
        type: 'success',
        isLoading: false,
        autoClose: 1600,
      });

      fetchResumes();
    } catch {
      toast.update(toastId, {
        render: 'Failed to update current resume.',
        type: 'error',
        isLoading: false,
        autoClose: 2500,
      });
    }
  };

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
                  Resume Center
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  My Resumes
                  <span className="block bg-linear-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    upload, preview, and manage.
                  </span>
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Keep your latest resume ready for job applications. Upload PDF, DOC, DOCX, or TXT files.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                <StatCard value={resumes.length} label="Total Resumes" />
                <StatCard
                  value={resumes.some((resume) => resume.is_current) ? 'Yes' : 'No'}
                  label="Current Set"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* UPLOAD FORM */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
                <UploadIcon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Upload
                </p>
                <h2 className="text-xl font-black text-slate-950">
                  New Resume
                </h2>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Resume title
                </label>

                <input
                  type="text"
                  placeholder="Example: Software Engineer CV"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">
                  Resume file
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-black file:text-white hover:border-indigo-300 focus:border-indigo-500 focus:outline-none"
                  accept=".pdf,.doc,.docx,.txt"
                  required
                />

                <p className="mt-2 text-xs font-medium text-slate-500">
                  Supported: PDF, DOC, DOCX, TXT
                </p>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-black text-slate-800">
                    Set as current resume
                  </p>
                  <p className="text-xs text-slate-500">
                    Use this as your default resume.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Upload Resume
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 rounded-3xl bg-indigo-50 p-4">
              <p className="text-sm font-black text-indigo-700">
                Logged in as
              </p>
              <p className="mt-1 truncate text-sm font-medium text-indigo-600">
                {user?.email || 'User'}
              </p>
            </div>
          </section>

          {/* RESUME LIST */}
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                  Library
                </p>
                <h2 className="text-xl font-black text-slate-950">
                  Uploaded Resumes
                </h2>
              </div>

              <button
                type="button"
                onClick={fetchResumes}
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
                    Loading resumes...
                  </p>
                </div>
              </div>
            ) : resumes.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                    <DocumentIcon className="h-7 w-7" />
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-900">
                    No resumes uploaded yet
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Upload your first resume to start applying for jobs faster.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-130 space-y-3 overflow-y-auto pr-1">
                {resumes.map((resume) => {
                  const filename = getDownloadName(resume);

                  return (
                    <article
                      key={resume.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                            <DocumentIcon className="h-6 w-6" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-base font-black text-slate-950">
                                {resume.title || 'Untitled Resume'}
                              </h3>

                              {resume.is_current && (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                                  Current
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              Uploaded: {formatDate(resume.uploaded_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <button
                            type="button"
                            onClick={() => handlePreview(resume)}
                            className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200"
                          >
                            Preview
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(resume.id, filename)}
                            className="rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100"
                          >
                            Download
                          </button>

                          {!resume.is_current && (
                            <button
                              type="button"
                              onClick={() => handleSetCurrent(resume.id)}
                              className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
                            >
                              Set Current
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(resume)}
                            className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
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
                Delete this resume?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                This action cannot be undone. The selected resume will be permanently removed from your account.
              </p>
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Selected Resume
                </p>

                <p className="mt-1 truncate text-sm font-black text-slate-900">
                  {deleteTarget.title || 'Untitled Resume'}
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Uploaded: {formatDate(deleteTarget.uploaded_at)}
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
                  onClick={confirmDeleteResume}
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

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-4 backdrop-blur-sm">
          <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Resume Preview
                </p>
                <h3 className="truncate text-lg font-black text-slate-950">
                  {preview.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={closePreview}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 bg-slate-100">
              {preview.type?.includes('pdf') || preview.filename?.endsWith('.pdf') ? (
                <iframe
                  src={preview.url}
                  className="h-full w-full border-0"
                  title="Resume Preview"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center">
                  <div className="max-w-md rounded-4xl bg-white p-8 shadow-xl shadow-slate-300/60">
                    <DocumentIcon className="mx-auto h-12 w-12 text-indigo-600" />
                    <h4 className="mt-4 text-xl font-black text-slate-950">
                      Preview not available
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      This file type may not open in browser preview. Please download it to view.
                    </p>

                    <a
                      href={preview.url}
                      download={preview.filename}
                      className="mt-5 inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white"
                    >
                      Download File
                    </a>
                  </div>
                </div>
              )}
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

/* ================= HELPERS ================= */

function formatDate(dateValue) {
  if (!dateValue) return 'Not available';

  return new Date(dateValue).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDownloadName(resume) {
  if (resume?.filename) return resume.filename;
  if (resume?.file_name) return resume.file_name;

  const title = resume?.title || 'resume';
  const cleanTitle = title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'resume';

  return `${cleanTitle}.pdf`;
}

/* ================= ICONS ================= */

function UploadIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function DocumentIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M8 13h8M8 17h5" />
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