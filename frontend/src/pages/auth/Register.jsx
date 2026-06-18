import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('JOB_SEEKER');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);

    const toastId = toast.loading('Creating your account...');

    try {
      await register(email, password, role);

      toast.update(toastId, {
        render: 'Account created successfully. Please login now.',
        type: 'success',
        isLoading: false,
        autoClose: 1800,
      });

      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('JOB_SEEKER');

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            registered: true,
            email,
          },
        });
      }, 900);
    } catch (err) {
      toast.update(toastId, {
        render:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Registration failed. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[0.9fr_1.1fr]">
        {/* ================= LEFT PANEL ================= */}
        <section className="relative hidden overflow-hidden px-10 py-6 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0">
            <div className="absolute left-8 top-10 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="absolute bottom-10 right-8 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
          </div>

          <Link to="/" className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-emerald-400 shadow-lg shadow-indigo-500/25">
              <BriefcaseIcon className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-lg font-black">CareerConnect Pro</h1>
              <p className="text-xs text-slate-400">Recruitment Platform</p>
            </div>
          </Link>

          <div className="relative z-10 max-w-lg">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Create your hiring workspace
            </div>

            <h2 className="text-4xl font-black leading-tight tracking-tight">
              Start your journey,
              <span className="block bg-linear-to-r from-emerald-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                hire or get hired.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Create your account, choose your role, and continue to login securely.
            </p>

            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-xl font-black">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-500">
            © {new Date().getFullYear()} CareerConnect Pro
          </p>
        </section>

        {/* ================= RIGHT FORM PANEL ================= */}
        <section className="flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-emerald-50 px-4 py-3 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-4 text-center lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-emerald-400 text-white">
                  <BriefcaseIcon className="h-5 w-5" />
                </div>

                <div className="text-left">
                  <h1 className="text-lg font-black text-slate-950">CareerConnect Pro</h1>
                  <p className="text-xs text-slate-500">Recruitment Platform</p>
                </div>
              </Link>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70">
              <div className="mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                  Get Started
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Create account
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  Register first, then login with your new account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Email address
                  </label>

                  <div className="relative">
                    <MailIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <LockIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-12 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="Minimum 8 characters"
                      required
                      autoComplete="new-password"
                      minLength={8}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    Confirm password
                  </label>

                  <div className="relative">
                    <LockIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-12 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="Re-enter password"
                      required
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Select role
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {roleOptions.map((option) => {
                      const Icon = option.icon;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setRole(option.value)}
                          className={`rounded-2xl border px-2 py-2.5 text-center transition ${
                            role === option.value
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          <Icon className="mx-auto h-5 w-5" />
                          <span className="mt-1 block text-xs font-black">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-emerald-600 to-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRightIcon className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-black text-emerald-600 hover:text-emerald-500"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-slate-500">
              After registration, you will be redirected to login.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= DATA ================= */

const stats = [
  { value: '10k+', label: 'Companies' },
  { value: '2.4M', label: 'Users' },
  { value: 'Free', label: 'Forever' },
];

const roleOptions = [
  { value: 'JOB_SEEKER', label: 'Seeker', icon: SearchIcon },
  { value: 'RECRUITER', label: 'Recruiter', icon: UsersIcon },
  { value: 'ADMIN', label: 'Admin', icon: ShieldIcon },
];

/* ================= ICONS ================= */

function BriefcaseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h14" />
    </svg>
  );
}

function MailIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4V6Zm0 0 8 7 8-7" />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z" />
    </svg>
  );
}

function EyeIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function EyeOffIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6M8.1 5.4A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18.6 18.6 0 0 1-3.2 4.5M6.2 6.9C3.5 8.9 2 12 2 12s3.5 8 10 8a10.8 10.8 0 0 0 5.1-1.3" />
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

function SearchIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 21a8 8 0 0 1 16 0M18 8a3 3 0 0 1 0 6M22 21a6 6 0 0 0-4-5.7" />
    </svg>
  );
}

function ShieldIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.5 12 1.8 1.8 3.7-4" />
    </svg>
  );
}