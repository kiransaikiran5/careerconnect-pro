import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const emptyFilters = {
  user_id: '',
  action: '',
  start_date: '',
  end_date: '',
};

const actionOptions = [
  { value: 'USER_REGISTER', label: 'User Register' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'JOB_CREATE', label: 'Job Create' },
  { value: 'JOB_DEACTIVATE', label: 'Job Deactivate' },
  { value: 'APPLICATION_SUBMIT', label: 'Application Submit' },
  { value: 'APPLICATION_SHORTLISTED', label: 'Application Shortlisted' },
  { value: 'APPLICATION_REJECTED', label: 'Application Rejected' },
];

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(false);

  const totalLogs = useMemo(() => logs.length, [logs]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};

      if (filters.user_id.trim()) {
        params.user_id = Number(filters.user_id);
      }

      if (filters.action) {
        params.action = filters.action;
      }

      if (filters.start_date) {
        params.start_date = new Date(`${filters.start_date}T00:00:00`).toISOString();
      }

      if (filters.end_date) {
        params.end_date = new Date(`${filters.end_date}T23:59:59`).toISOString();
      }

      const res = await api.get('/audit-logs', { params });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.logs)
            ? res.data.logs
            : [];

      setLogs(list);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        toast.error('Only admin can view audit logs.');
      } else {
        toast.error(err.response?.data?.detail || 'Failed to load audit logs.');
      }

      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchLogs();
  };

  const handleReset = () => {
    setFilters(emptyFilters);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="relative bg-slate-950 px-5 py-6 text-white sm:px-7">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-8 top-3 h-28 w-28 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Admin Security
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Audit Logs
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Track user actions, login activity, job changes, and application events.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Total Records
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {totalLogs}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_1.4fr_1fr_1fr_auto_auto]">
            <Field label="User ID">
              <input
                type="number"
                name="user_id"
                placeholder="Example: 1"
                value={filters.user_id}
                onChange={handleFilterChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </Field>

            <Field label="Action">
              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="">All Actions</option>
                {actionOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Start Date">
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </Field>

            <Field label="End Date">
              <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </Field>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Loading...' : 'Filter'}
              </button>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        {/* Table */}
        <section className="mt-5 overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Activity Records
              </h2>
              <p className="text-sm font-semibold text-slate-500">
                Latest audit activity from your system
              </p>
            </div>

            <button
              type="button"
              onClick={fetchLogs}
              disabled={loading}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <TableHead>ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <SpinnerIcon className="h-9 w-9 animate-spin text-indigo-600" />
                        <p className="mt-4 text-sm font-black text-slate-700">
                          Loading audit logs...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="mx-auto max-w-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                          <ShieldIcon className="h-7 w-7" />
                        </div>

                        <p className="mt-4 text-sm font-black text-slate-700">
                          No logs found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Try changing the filters or refresh the page.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="transition hover:bg-slate-50">
                      <TableCell>
                        <span className="font-black text-slate-900">
                          #{log.id}
                        </span>
                      </TableCell>

                      <TableCell>
                        {log.user_id ?? log.user?.id ?? 'N/A'}
                      </TableCell>

                      <TableCell>
                        <ActionBadge action={log.action} />
                      </TableCell>

                      <TableCell>
                        <div className="max-w-xl rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
                          {formatDetails(log.details)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="whitespace-nowrap text-sm font-bold text-slate-700">
                          {formatDate(log.timestamp || log.created_at)}
                        </span>
                      </TableCell>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-black text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500">
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return (
    <td className="px-6 py-4 align-top text-sm text-slate-700">
      {children}
    </td>
  );
}

function ActionBadge({ action }) {
  const styles = getActionStyle(action);

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-black ${styles}`}>
      {formatAction(action)}
    </span>
  );
}

/* ================= HELPERS ================= */

function formatAction(action) {
  if (!action) return 'Unknown';

  return String(action)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getActionStyle(action) {
  const value = String(action || '').toUpperCase();

  if (value.includes('LOGIN')) {
    return 'bg-emerald-100 text-emerald-700';
  }

  if (value.includes('REJECT') || value.includes('DEACTIVATE')) {
    return 'bg-red-100 text-red-700';
  }

  if (value.includes('SHORTLIST')) {
    return 'bg-blue-100 text-blue-700';
  }

  if (value.includes('JOB')) {
    return 'bg-indigo-100 text-indigo-700';
  }

  if (value.includes('APPLICATION')) {
    return 'bg-amber-100 text-amber-700';
  }

  return 'bg-slate-100 text-slate-700';
}

function formatDetails(details) {
  if (!details) return '-';

  if (typeof details === 'string') {
    return details;
  }

  try {
    return JSON.stringify(details);
  } catch {
    return '-';
  }
}

function formatDate(value) {
  if (!value) return 'N/A';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ================= ICONS ================= */

function ShieldIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-3 7-10V5l-7-3-7 3v6c0 7 7 10 7 10Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-5" />
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