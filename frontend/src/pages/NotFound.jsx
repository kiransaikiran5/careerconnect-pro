import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
        <div className="relative bg-slate-950 px-5 py-8 text-center text-white sm:px-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-8 top-4 h-32 w-32 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="absolute bottom-0 right-8 h-36 w-36 rounded-full bg-cyan-500/20 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-white shadow-lg backdrop-blur">
              <WarningIcon className="h-7 w-7" />
            </div>

            <p className="mt-4 text-xs font-black uppercase tracking-widest text-cyan-300">
              Page Not Found
            </p>

            <h1 className="mt-2 text-6xl font-black tracking-tight sm:text-7xl">
              404
            </h1>

            <h2 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">
              This page is not available.
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-300">
              The page you are trying to open does not exist, was moved, or the URL is incorrect.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40"
              >
                Go Home
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 bg-white p-4 sm:grid-cols-3">
          <QuickLink to="/" label="Home" />
          <QuickLink to="/jobs" label="Find Jobs" />
          <QuickLink to="/login" label="Sign in" />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, label }) {
  return (
    <Link
      to={to}
      className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
    >
      {label}
    </Link>
  );
}

function WarningIcon(props) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.3 4.3 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0Z"
      />
    </svg>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
      />
    </svg>
  );
}