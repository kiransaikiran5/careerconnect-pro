// src/pages/dashboard/Dashboard.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import { AuthContext } from '../../contexts/AuthContext';

import JobSeekerDashboard from './JobSeekerDashboard';
import RecruiterDashboard from '../recruiter/RecruiterDashboard';
import AdminDashboard from '../admin/AdminDashboard';

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-4xl border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-200/60">
          <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

          <p className="mt-4 text-sm font-black text-slate-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user?.role || '').toUpperCase();

  switch (role) {
    case 'JOB_SEEKER':
      return <JobSeekerDashboard />;

    case 'RECRUITER':
      return <RecruiterDashboard />;

    case 'ADMIN':
      return <AdminDashboard />;

    default:
      return <Navigate to="/" replace />;
  }
}

function SpinnerIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
      />
    </svg>
  );
}