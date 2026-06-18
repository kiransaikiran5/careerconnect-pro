import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [rememberedEmails, setRememberedEmails] = useState([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmails = getRememberedEmails();

    const oldSingleEmail = localStorage.getItem('remembered_email');
    let finalEmails = storedEmails;

    if (oldSingleEmail && !storedEmails.includes(oldSingleEmail)) {
      finalEmails = [oldSingleEmail, ...storedEmails].slice(0, 6);
      localStorage.setItem('remembered_emails', JSON.stringify(finalEmails));
      localStorage.removeItem('remembered_email');
    }

    setRememberedEmails(finalEmails);

    if (finalEmails.length > 0) {
      setEmail(finalEmails[0]);
      setRememberMe(true);
    }
  }, []);

  const filteredRememberedEmails = rememberedEmails.filter((savedEmail) => {
    if (!email.trim()) return true;

    return savedEmail.toLowerCase().includes(email.trim().toLowerCase());
  });

  const saveRememberedEmail = (emailValue) => {
    const cleanEmail = emailValue.trim();

    if (!cleanEmail) return;

    const currentEmails = getRememberedEmails();

    const updatedEmails = [
      cleanEmail,
      ...currentEmails.filter(
        (item) => item.toLowerCase() !== cleanEmail.toLowerCase()
      ),
    ].slice(0, 6);

    localStorage.setItem('remembered_emails', JSON.stringify(updatedEmails));
    setRememberedEmails(updatedEmails);
  };

  const removeRememberedEmail = (emailValue) => {
    const updatedEmails = rememberedEmails.filter(
      (item) => item.toLowerCase() !== emailValue.toLowerCase()
    );

    localStorage.setItem('remembered_emails', JSON.stringify(updatedEmails));
    setRememberedEmails(updatedEmails);

    if (email.toLowerCase() === emailValue.toLowerCase()) {
      setEmail('');
      setRememberMe(false);
    }
  };

  const selectRememberedEmail = (emailValue) => {
    setEmail(emailValue);
    setRememberMe(true);
    setShowEmailSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password.');
      return;
    }

    setLoading(true);

    const toastId = toast.loading('Signing you in...');

    try {
      await login(email.trim(), password);

      if (rememberMe) {
        saveRememberedEmail(email.trim());
      }

      toast.update(toastId, {
        render: 'Login successful. Welcome back!',
        type: 'success',
        isLoading: false,
        autoClose: 1500,
      });

      setTimeout(() => {
        navigate('/');
      }, 700);
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.detail || 'Invalid email or password.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-hidden bg-slate-50">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[0.9fr_1.1fr]">
        {/* LEFT BRAND PANEL */}
        <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-6 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0">
            <div className="absolute left-8 top-8 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="absolute bottom-8 right-8 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
          </div>

          <Link to="/" className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25">
              <BriefcaseIcon className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-lg font-black">CareerConnect Pro</h1>
              <p className="text-xs text-slate-400">Recruitment Platform</p>
            </div>
          </Link>

          <div className="relative z-10 max-w-lg">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Smart hiring starts here
            </div>

            <h2 className="text-4xl font-black leading-tight tracking-tight">
              Welcome back,
              <span className="block bg-linear-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                hire better today.
              </span>
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Access your hiring dashboard, manage job posts, review candidates, and track interviews from one clean workspace.
            </p>

            <div className="mt-7 grid max-w-md grid-cols-3 gap-3">
              {brandStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <CheckCircleIcon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-black text-white">
                    Enterprise-ready login
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Secure access for recruiters, admins, and candidates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-500">
            © {new Date().getFullYear()} CareerConnect Pro
          </p>
        </section>

        {/* RIGHT LOGIN PANEL */}
        <section className="flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-4 text-center lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25">
                  <BriefcaseIcon className="h-5 w-5" />
                </div>

                <div className="text-left">
                  <h1 className="text-lg font-black text-slate-950">
                    CareerConnect Pro
                  </h1>
                  <p className="text-xs text-slate-500">
                    Recruitment Platform
                  </p>
                </div>
              </Link>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                  Welcome Back
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Sign in to account
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  Enter your email and password to continue.
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
                      onFocus={() => setShowEmailSuggestions(true)}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowEmailSuggestions(false);
                        }, 150);
                      }}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setShowEmailSuggestions(true);
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />

                    {showEmailSuggestions && filteredRememberedEmails.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80">
                        <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            Saved emails
                          </p>
                        </div>

                        <div className="max-h-56 overflow-y-auto p-2">
                          {filteredRememberedEmails.map((savedEmail) => (
                            <div
                              key={savedEmail}
                              className="group flex items-center justify-between gap-2 rounded-2xl px-3 py-2 transition hover:bg-indigo-50"
                            >
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectRememberedEmail(savedEmail);
                                }}
                                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                              >
                                <UserCircleIcon className="h-5 w-5 shrink-0 text-indigo-500" />

                                <span className="truncate text-sm font-bold text-slate-700 group-hover:text-indigo-700">
                                  {savedEmail}
                                </span>
                              </button>

                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  removeRememberedEmail(savedEmail);
                                }}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                aria-label="Remove saved email"
                              >
                                <CloseIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-12 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="Enter password"
                      required
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* BELOW PASSWORD INPUT */}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl px-1">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />

                      <span className="text-xs font-bold text-slate-600">
                        Remember me
                      </span>
                    </label>

                    <Link
                      to="/forgot-password"
                      className="inline-flex items-center gap-1.5 rounded-xl px-1 text-xs font-black text-indigo-600 transition hover:text-indigo-500"
                    >
                      <KeyIcon className="h-4 w-4" />
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <SpinnerIcon className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRightIcon className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-center">
                <p className="text-sm text-slate-600">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    className="font-black text-indigo-600 transition hover:text-indigo-500"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-slate-500">
              Secure login for jobs, candidates, interviews, and reports.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function getRememberedEmails() {
  try {
    const saved = JSON.parse(localStorage.getItem('remembered_emails') || '[]');

    if (!Array.isArray(saved)) return [];

    return saved
      .filter(Boolean)
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

/* ================= DATA ================= */

const brandStats = [
  { value: '10k+', label: 'Jobs' },
  { value: '2.4M', label: 'Candidates' },
  { value: '98%', label: 'Success' },
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

function KeyIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a4 4 0 1 1-1.2 2.85L9 14.65V17H6.65L5 18.65V21H2v-3.65l8.15-8.15A4 4 0 0 1 15 7Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5h.01" />
    </svg>
  );
}

function UserCircleIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 21a7.5 7.5 0 0 1 15 0" />
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

function CheckCircleIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5 11 14.5 15.5 9.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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