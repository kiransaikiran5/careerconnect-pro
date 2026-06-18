import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          {/* Left Content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Modern recruitment platform for growing teams
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Hire the right talent,
              <span className="block bg-linear-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                faster and smarter.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              CareerConnect Pro helps companies post jobs, manage applications,
              shortlist candidates, schedule interviews, and build a smooth hiring workflow.
            </p>

            {!user ? (
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-indigo-500 to-cyan-500 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition hover:-translate-y-1 hover:shadow-indigo-500/40"
                >
                  Get Started Free
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="mt-8 max-w-xl rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-cyan-400 text-lg font-black text-white">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-400">Logged in as</p>
                    <p className="truncate font-semibold text-white">{user.email}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-4xl bg-linear-to-r from-indigo-500/20 to-cyan-500/20 blur-2xl" />

            <div className="relative rounded-4xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
              <div className="rounded-3xl bg-slate-900 p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Recruitment Dashboard</p>
                    <h2 className="mt-1 text-2xl font-black text-white">Hiring Overview</h2>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    Live
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {dashboardCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <div
                        key={card.title}
                        className="rounded-2xl border border-white/10 bg-white/6 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                            <Icon className="h-5 w-5" />
                          </div>

                          <span className="text-xs font-bold text-emerald-300">
                            {card.trend}
                          </span>
                        </div>

                        <p className="text-2xl font-black text-white">{card.value}</p>
                        <p className="mt-1 text-sm text-slate-400">{card.title}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/6 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-white">Top Matches</h3>
                    <span className="text-xs font-medium text-slate-400">This week</span>
                  </div>

                  <div className="space-y-3">
                    {candidates.map((candidate) => (
                      <div
                        key={candidate.name}
                        className="flex items-center gap-3 rounded-2xl bg-slate-950/70 p-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-cyan-400 text-sm font-black text-white">
                          {candidate.name.charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{candidate.name}</p>
                          <p className="truncate text-xs text-slate-400">{candidate.role}</p>
                        </div>

                        <span className="rounded-lg bg-indigo-400/10 px-2.5 py-1 text-xs font-black text-indigo-300">
                          {candidate.match}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-white py-16 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600">
              Platform Features
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Everything needed for professional hiring
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Simple tools for recruiters, employers, and candidates to manage hiring without confusion.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="text-lg font-black">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= WORKFLOW ================= */}
      <section className="bg-slate-50 py-16 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700">
                Simple Workflow
              </span>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                From job post to final hire
              </h2>
            </div>

            <p className="max-w-xl text-base leading-7 text-slate-600">
              A clear hiring process helps your team move faster and avoid missing good candidates.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">
                  {index + 1}
                </div>

                <h3 className="font-black">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-4xl bg-slate-950 p-8 text-center text-white shadow-2xl sm:p-12">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Ready to build your hiring workspace?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Start with CareerConnect Pro and manage candidates, jobs, interviews, and hiring reports in one clean place.
          </p>

          <Link
            to={user ? '/dashboard' : '/register'}
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-sm font-black text-slate-950 transition hover:-translate-y-1 hover:bg-slate-100"
          >
            {user ? 'Open Dashboard' : 'Create Free Account'}
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ================= DATA ================= */

const heroStats = [
  { value: '10k+', label: 'Active Jobs' },
  { value: '2.4M', label: 'Candidates' },
  { value: '98%', label: 'Success Rate' },
];

const dashboardCards = [
  { title: 'Applications', value: '1,248', trend: '+18%', icon: UsersIcon },
  { title: 'Interviews', value: '86', trend: '+12%', icon: CalendarIcon },
  { title: 'Offers Sent', value: '32', trend: '+9%', icon: MailIcon },
  { title: 'Hired', value: '19', trend: '+21%', icon: CheckCircleIcon },
];

const candidates = [
  { name: 'Rahul Mehta', role: 'Frontend Developer', match: '96%' },
  { name: 'Ananya Rao', role: 'HR Executive', match: '92%' },
  { name: 'Vikram Singh', role: 'Product Designer', match: '89%' },
];

const features = [
  {
    title: 'AI Candidate Matching',
    description: 'Match candidates with suitable jobs based on skills, experience, and job requirements.',
    icon: SparklesIcon,
  },
  {
    title: 'Smart Pipeline',
    description: 'Track applicants from applied to shortlisted, interview, offer, and hired status.',
    icon: WorkflowIcon,
  },
  {
    title: 'Interview Scheduling',
    description: 'Plan interview rounds and keep the recruitment process organized for your HR team.',
    icon: CalendarIcon,
  },
];

const steps = [
  {
    title: 'Post Job',
    description: 'Create job openings with salary, skills, location, and experience requirements.',
  },
  {
    title: 'Review Candidates',
    description: 'Check applications and shortlist the best profiles for each role.',
  },
  {
    title: 'Schedule Interview',
    description: 'Move candidates to interview rounds and track their progress.',
  },
  {
    title: 'Hire Talent',
    description: 'Send offers and complete the hiring process with confidence.',
  },
];

/* ================= ICONS ================= */

function ArrowRightIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function SparklesIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.8 15.9 9 18.8l-.8-2.9A4.5 4.5 0 0 0 5.1 12.8L2.3 12l2.8-.8a4.5 4.5 0 0 0 3.1-3.1L9 5.3l.8 2.8a4.5 4.5 0 0 0 3.1 3.1l2.8.8-2.8.8a4.5 4.5 0 0 0-3.1 3.1ZM18 2.3l.3 1a3.4 3.4 0 0 0 2.4 2.4l1 .3-1 .3a3.4 3.4 0 0 0-2.4 2.4l-.3 1-.3-1a3.4 3.4 0 0 0-2.4-2.4l-1-.3 1-.3a3.4 3.4 0 0 0 2.4-2.4l.3-1Z" />
    </svg>
  );
}

function WorkflowIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h6m-6 5h12M6 17h8M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" />
    </svg>
  );
}

function CalendarIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3m8-3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 21a8 8 0 0 1 16 0M18 8a3 3 0 0 1 0 6M22 21a6 6 0 0 0-4-5.7" />
    </svg>
  );
}

function MailIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4V6Zm0 0 8 7 8-7" />
    </svg>
  );
}

function CheckCircleIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5 11 14.5 15.5 9.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}