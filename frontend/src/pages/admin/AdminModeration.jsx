import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const tabs = [
  { key: 'users', label: 'Users' },
  { key: 'companies', label: 'Companies' },
  { key: 'recruiters', label: 'Recruiters' },
  { key: 'reports', label: 'Reports' },
];

export default function AdminModeration() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeCount = useMemo(() => {
    if (tab === 'users') return users.length;
    if (tab === 'companies') return companies.length;
    if (tab === 'recruiters') return recruiters.length;
    if (tab === 'reports') return reports.length;
    return 0;
  }, [tab, users, companies, recruiters, reports]);

  const parseList = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.[key])) return data[key];
    return [];
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      if (tab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(parseList(res.data, 'users'));
      }

      if (tab === 'companies') {
        const res = await api.get('/companies');
        setCompanies(parseList(res.data, 'companies'));
      }

      if (tab === 'recruiters') {
        const res = await api.get('/recruiters');
        setRecruiters(parseList(res.data, 'recruiters'));
      }

      if (tab === 'reports') {
        const res = await api.get('/reports');
        setReports(parseList(res.data, 'reports'));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        toast.error('Only admin can access moderation.');
      } else if (err.response?.status === 404) {
        toast.error('API endpoint not found. Please check backend route.');
      } else {
        toast.error(err.response?.data?.detail || 'Failed to load data.');
      }

      if (tab === 'users') setUsers([]);
      if (tab === 'companies') setCompanies([]);
      if (tab === 'recruiters') setRecruiters([]);
      if (tab === 'reports') setReports([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVerifyCompany = async (id) => {
    try {
      await api.put(`/admin/verify-company/${id}`);
      toast.success('Company verified successfully.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to verify company.');
    }
  };

  const handleVerifyRecruiter = async (id) => {
    try {
      await api.put(`/admin/verify-recruiter/${id}`);
      toast.success('Recruiter verified successfully.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to verify recruiter.');
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-active`);
      toast.success(res.data?.message || 'User status updated.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update user status.');
    }
  };

  const handleReportAction = async (reportId, status) => {
    try {
      await api.put(`/reports/${reportId}`, null, {
        params: { status },
      });

      toast.success(`Report marked as ${status}.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update report.');
    }
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
                  Admin Control
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Admin Moderation
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Manage users, verify companies, approve recruiters, and review reports.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Current Records
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {activeCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="mt-5 rounded-4xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`rounded-3xl px-4 py-3 text-sm font-black transition ${
                  tab === item.key
                    ? 'bg-linear-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* Content */}
        <section className="mt-5 overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                {tabs.find((item) => item.key === tab)?.label}
              </h2>
              <p className="text-sm font-semibold text-slate-500">
                Review and manage {tab} records
              </p>
            </div>

            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <LoadingState />
          ) : (
            <>
              {tab === 'users' && (
                <UsersTable users={users} onToggleActive={handleToggleActive} />
              )}

              {tab === 'companies' && (
                <CompaniesTable companies={companies} onVerify={handleVerifyCompany} />
              )}

              {tab === 'recruiters' && (
                <RecruitersTable recruiters={recruiters} onVerify={handleVerifyRecruiter} />
              )}

              {tab === 'reports' && (
                <ReportsTable reports={reports} onAction={handleReportAction} />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/* ================= TABLES ================= */

function UsersTable({ users, onToggleActive }) {
  if (users.length === 0) {
    return <EmptyState message="No users found." />;
  }

  return (
    <Table>
      <thead className="bg-slate-50">
        <tr>
          <TableHead>ID</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 bg-white">
        {users.map((user) => (
          <tr key={user.id} className="transition hover:bg-slate-50">
            <TableCell>#{user.id}</TableCell>
            <TableCell>{user.email || 'N/A'}</TableCell>
            <TableCell>
              <RoleBadge role={user.role} />
            </TableCell>
            <TableCell>
              <StatusBadge active={user.is_active} />
            </TableCell>
            <TableCell>
              <button
                type="button"
                onClick={() => onToggleActive(user.id)}
                className={`rounded-2xl px-4 py-2 text-xs font-black transition ${
                  user.is_active
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {user.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </TableCell>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function CompaniesTable({ companies, onVerify }) {
  if (companies.length === 0) {
    return <EmptyState message="No companies found." />;
  }

  return (
    <Table>
      <thead className="bg-slate-50">
        <tr>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead>Actions</TableHead>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 bg-white">
        {companies.map((company) => (
          <tr key={company.id} className="transition hover:bg-slate-50">
            <TableCell>#{company.id}</TableCell>
            <TableCell>{company.name || company.company_name || 'N/A'}</TableCell>
            <TableCell>{company.location || 'N/A'}</TableCell>
            <TableCell>
              <StatusBadge active={company.is_verified} trueText="Verified" falseText="Pending" />
            </TableCell>
            <TableCell>
              {!company.is_verified ? (
                <button
                  type="button"
                  onClick={() => onVerify(company.id)}
                  className="rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
                >
                  Verify
                </button>
              ) : (
                <span className="text-xs font-black text-slate-400">No action</span>
              )}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function RecruitersTable({ recruiters, onVerify }) {
  if (recruiters.length === 0) {
    return <EmptyState message="No recruiters found." />;
  }

  return (
    <Table>
      <thead className="bg-slate-50">
        <tr>
          <TableHead>ID</TableHead>
          <TableHead>User ID</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead>Actions</TableHead>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 bg-white">
        {recruiters.map((recruiter) => (
          <tr key={recruiter.id} className="transition hover:bg-slate-50">
            <TableCell>#{recruiter.id}</TableCell>
            <TableCell>{recruiter.user_id || 'N/A'}</TableCell>
            <TableCell>{recruiter.email || recruiter.user_email || 'N/A'}</TableCell>
            <TableCell>
              {recruiter.company_name ||
                recruiter.company?.name ||
                recruiter.company?.company_name ||
                'N/A'}
            </TableCell>
            <TableCell>
              <StatusBadge active={recruiter.is_verified} trueText="Verified" falseText="Pending" />
            </TableCell>
            <TableCell>
              {!recruiter.is_verified ? (
                <button
                  type="button"
                  onClick={() => onVerify(recruiter.id)}
                  className="rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
                >
                  Verify
                </button>
              ) : (
                <span className="text-xs font-black text-slate-400">No action</span>
              )}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function ReportsTable({ reports, onAction }) {
  if (reports.length === 0) {
    return <EmptyState message="No reports found." />;
  }

  return (
    <Table>
      <thead className="bg-slate-50">
        <tr>
          <TableHead>ID</TableHead>
          <TableHead>Reporter ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Content ID</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 bg-white">
        {reports.map((report) => (
          <tr key={report.id} className="transition hover:bg-slate-50">
            <TableCell>#{report.id}</TableCell>
            <TableCell>{report.reporter_id || report.user_id || 'N/A'}</TableCell>
            <TableCell>{report.content_type || report.type || 'N/A'}</TableCell>
            <TableCell>{report.content_id || 'N/A'}</TableCell>
            <TableCell>
              <div className="max-w-xs whitespace-pre-wrap rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                {report.reason || '-'}
              </div>
            </TableCell>
            <TableCell>
              <ReportStatusBadge status={report.status} />
            </TableCell>
            <TableCell>
              {String(report.status || '').toLowerCase() === 'pending' ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onAction(report.id, 'reviewed')}
                    className="rounded-2xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                  >
                    Reviewed
                  </button>

                  <button
                    type="button"
                    onClick={() => onAction(report.id, 'dismissed')}
                    className="rounded-2xl bg-red-50 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <span className="text-xs font-black text-slate-400">No action</span>
              )}
            </TableCell>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

/* ================= COMPONENTS ================= */

function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        {children}
      </table>
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
    <td className="whitespace-nowrap px-6 py-4 align-top text-sm font-semibold text-slate-700">
      {children}
    </td>
  );
}

function StatusBadge({ active, trueText = 'Active', falseText = 'Inactive' }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        active
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {active ? trueText : falseText}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">
      {formatText(role)}
    </span>
  );
}

function ReportStatusBadge({ status }) {
  const value = String(status || '').toLowerCase();

  const style =
    value === 'reviewed'
      ? 'bg-blue-100 text-blue-700'
      : value === 'dismissed'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${style}`}>
      {formatText(status || 'pending')}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center px-6 py-16">
      <div className="text-center">
        <SpinnerIcon className="mx-auto h-9 w-9 animate-spin text-indigo-600" />
        <p className="mt-4 text-sm font-black text-slate-700">
          Loading moderation data...
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
        <ShieldIcon className="h-7 w-7" />
      </div>

      <p className="mt-4 text-sm font-black text-slate-700">
        {message}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Try refreshing this section.
      </p>
    </div>
  );
}

/* ================= HELPERS ================= */

function formatText(value) {
  if (!value) return 'N/A';

  return String(value)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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