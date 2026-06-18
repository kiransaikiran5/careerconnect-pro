import { Link } from 'react-router-dom';

export default function JobSeekerDashboard() {
  const cards = [
    {
      title: 'My Applications',
      description: 'Track jobs you applied for and view application status.',
      icon: DocumentIcon,
      path: '/applications',
      value: '12',
      label: 'Applied Jobs',
      style: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    },
    {
      title: 'Saved Jobs',
      description: 'View jobs you saved and apply when ready.',
      icon: StarIcon,
      path: '/saved-jobs',
      value: '8',
      label: 'Saved',
      style: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    {
      title: 'Notifications',
      description: 'Check recruiter updates, alerts, and job responses.',
      icon: BellIcon,
      path: '/notifications',
      value: '5',
      label: 'New Alerts',
      style: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    {
      title: 'Resume Tips',
      description: 'Improve your resume and increase interview chances.',
      icon: PencilIcon,
      path: '/resume-tips',
      value: 'Pro',
      label: 'Guidance',
      style: 'from-purple-500 to-indigo-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HERO SECTION */}
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
          <div className="relative bg-slate-950 px-6 py-8 text-white sm:px-8">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-10 top-5 h-40 w-40 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-10 h-44 w-44 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Job Seeker Workspace
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Welcome back,
                  <span className="block bg-linear-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    manage your career smarter.
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                  Track your job applications, saved jobs, notifications, and resume improvement tips from one clean dashboard.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:min-w-80">
                <StatCard value="12" label="Applied" />
                <StatCard value="8" label="Saved" />
                <StatCard value="5" label="Alerts" />
              </div>
            </div>
          </div>
        </section>

        {/* DASHBOARD CARDS */}
        <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.path}
                className="group rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/70"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${card.style} text-white shadow-lg`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className={`rounded-2xl ${card.bg} px-3 py-1 text-xs font-black ${card.text}`}>
                    {card.value}
                  </div>
                </div>

                <h3 className="mt-5 text-lg font-black text-slate-950">
                  {card.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {card.description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    {card.label}
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        {/* LOWER SECTION */}
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Quick Overview
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Application Progress
                </h2>
              </div>

              <div className="rounded-2xl bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                This Week
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <ProgressItem title="Profile Completion" value="85%" width="w-[85%]" />
              <ProgressItem title="Resume Strength" value="72%" width="w-[72%]" />
              <ProgressItem title="Application Activity" value="64%" width="w-[64%]" />
            </div>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
              Resume Tip
            </p>

            <h2 className="mt-2 text-xl font-black text-slate-950">
              Improve your profile
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Add skills, update your resume, and keep your profile active to get better recruiter visibility.
            </p>

            <Link
              to="/profile"
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40"
            >
              Update Profile
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </div>
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

function ProgressItem({ title, value, width }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">{title}</p>
        <p className="text-sm font-black text-indigo-600">{value}</p>
      </div>

      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full bg-linear-to-r from-indigo-600 to-cyan-500 ${width}`} />
      </div>
    </div>
  );
}

/* ================= ICONS ================= */

function DocumentIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M8 13h8M8 17h6" />
    </svg>
  );
}

function StarIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    </svg>
  );
}

function BellIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17H9m9-2V10a6 6 0 1 0-12 0v5l-2 2h16l-2-2ZM10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function PencilIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14 7l3 3" />
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