import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);

    const toastId = toast.loading('Sending reset link...');

    try {
      const res = await api.post('/auth/forgot-password', {
        email: email.trim(),
      });

      const msg = res.data?.message || 'If the email exists, a reset link has been sent.';
      const token = res.data?.token;

      if (token) {
        toast.update(toastId, {
          render: 'Reset link generated. Redirecting...',
          type: 'success',
          isLoading: false,
          autoClose: 1400,
        });

        setTimeout(() => {
          navigate(`/reset-password?token=${encodeURIComponent(token)}`);
        }, 900);
      } else {
        toast.update(toastId, {
          render: msg,
          type: 'success',
          isLoading: false,
          autoClose: 2500,
        });
      }
    } catch (err) {
      toast.update(toastId, {
        render:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Something went wrong. Please try again.',
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
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-[0.9fr_1.1fr]">
          {/* ================= LEFT PANEL ================= */}
          <section className="relative hidden overflow-hidden bg-slate-950 p-8 text-white lg:block">
            <div className="absolute inset-0">
              <div className="absolute left-8 top-8 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-8 right-8 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 flex h-full min-h-105 flex-col justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25">
                  <BriefcaseIcon className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-lg font-black">CareerConnect Pro</h1>
                  <p className="text-xs text-slate-400">Account Recovery</p>
                </div>
              </Link>

              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Secure password recovery
                </div>

                <h2 className="max-w-md text-4xl font-black leading-tight tracking-tight">
                  Forgot your password?
                  <span className="block bg-linear-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    Reset it securely.
                  </span>
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                  Enter your registered email address. We will generate a secure reset link and guide you to create a new password.
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    'Secure reset token generation',
                    'Quick redirect to reset page',
                    'Protected account access',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                        <CheckIcon className="h-5 w-5" />
                      </div>

                      <span className="text-sm font-semibold text-slate-200">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} CareerConnect Pro
              </p>
            </div>
          </section>

          {/* ================= RIGHT FORM PANEL ================= */}
          <section className="flex items-center justify-center p-5 sm:p-7">
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <div className="mb-5 text-center lg:hidden">
                <Link to="/" className="inline-flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25">
                    <BriefcaseIcon className="h-5 w-5" />
                  </div>

                  <div className="text-left">
                    <h1 className="text-lg font-black text-slate-950">
                      CareerConnect Pro
                    </h1>
                    <p className="text-xs text-slate-500">Account Recovery</p>
                  </div>
                </Link>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <KeyIcon className="h-6 w-6" />
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-widest text-indigo-600">
                  Forgot Password
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Reset your password
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your registered email to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
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
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRightIcon className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 rounded-2xl bg-slate-50 p-3 text-center">
                <Link
                  to="/login"
                  className="text-sm font-black text-indigo-600 transition hover:text-indigo-500"
                >
                  ← Back to login
                </Link>
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                We keep your account recovery process secure and simple.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ================= ICONS ================= */

function BriefcaseIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 5h14" />
    </svg>
  );
}

function KeyIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.03 5.91c-.56-.1-1.16.03-1.56.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.82c0-.6.24-1.17.66-1.59l6.5-6.5c.4-.4.52-1 .43-1.56A6 6 0 1 1 21.75 8.25Z" />
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

function CheckIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
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