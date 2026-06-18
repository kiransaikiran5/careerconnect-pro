import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get('token') || '';

  const [manualToken, setManualToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const finalToken = useMemo(() => manualToken.trim(), [manualToken]);

  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const passwordStrength = [
    newPassword.length >= 8,
    /[A-Z]/.test(newPassword),
    /\d/.test(newPassword),
    /[^A-Za-z0-9]/.test(newPassword),
  ].filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!finalToken) {
      setError('Reset token is missing. Please open the reset link again or paste the token.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        token: finalToken,
        new_password: newPassword,
      });

      setMessage(res.data?.message || 'Password reset successfully. Redirecting to login...');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          'Reset failed. Please check your token and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-hidden bg-slate-50">
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-[0.85fr_1.15fr]">
          {/* LEFT PANEL */}
          <section className="relative hidden overflow-hidden bg-slate-950 p-8 text-white lg:block">
            <div className="absolute inset-0">
              <div className="absolute left-8 top-8 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-8 right-8 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 flex h-full min-h-105 flex-col justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25">
                  <ShieldIcon className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-lg font-black">CareerConnect Pro</h1>
                  <p className="text-xs text-slate-400">Secure Account Recovery</p>
                </div>
              </Link>

              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Password reset center
                </div>

                <h2 className="max-w-md text-4xl font-black leading-tight tracking-tight">
                  Create a new,
                  <span className="block bg-linear-to-r from-cyan-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    secure password.
                  </span>
                </h2>

                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                  Reset your password safely and get back into your recruitment workspace.
                </p>

                <div className="mt-6 space-y-3">
                  {['Secure token verification', 'Protected password update', 'Login redirect after reset'].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                          <CheckIcon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold text-slate-200">{item}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} CareerConnect Pro
              </p>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <section className="flex items-center justify-center p-5 sm:p-7">
            <div className="w-full max-w-md">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <KeyIcon className="h-6 w-6" />
                </div>

                <p className="mt-4 text-xs font-black uppercase tracking-widest text-indigo-600">
                  Reset Password
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  Set new password
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your new password to continue.
                </p>
              </div>

              {message && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                      <CheckIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-black text-emerald-700">Success</p>
                      <p className="mt-1 wrap-break-word text-sm leading-6 text-emerald-600">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <AlertIcon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-black text-red-700">Reset failed</p>
                      <p className="mt-1 wrap-break-word text-sm leading-6 text-red-600">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!message && (
                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                  {/* SHOW TOKEN BOX ONLY WHEN TOKEN IS MISSING FROM URL */}
                  {!tokenFromUrl && (
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-slate-700">
                        Reset token
                      </label>

                      <div className="relative">
                        <TokenIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />

                        <textarea
                          value={manualToken}
                          onChange={(e) => setManualToken(e.target.value)}
                          className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                          placeholder="Paste reset token here"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {tokenFromUrl && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                          <CheckIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-emerald-700">
                            Reset token verified
                          </p>
                          <p className="text-xs text-emerald-600">
                            Token received from reset link.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NEW PASSWORD */}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-700">
                      New password
                    </label>

                    <div className="relative">
                      <LockIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-12 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                        placeholder="Example: Sai@1234"
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

                  {/* CONFIRM PASSWORD */}
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
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-12 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                        placeholder="Re-enter password"
                        required
                        autoComplete="new-password"
                        minLength={8}
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

                    {confirmPassword && (
                      <p
                        className={`mt-1.5 text-xs font-bold ${
                          passwordsMatch ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                      </p>
                    )}
                  </div>

                  {/* COMPACT STRENGTH BAR */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-600">
                        Password strength
                      </p>
                      <p className="text-xs font-black text-indigo-600">
                        {passwordStrength}/4
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-2 rounded-full ${
                            passwordStrength >= step ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        />
                      ))}
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
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRightIcon className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-center">
                <Link
                  to="/login"
                  className="text-sm font-black text-indigo-600 transition hover:text-indigo-500"
                >
                  ← Back to login
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ================= ICONS ================= */

function KeyIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.03 5.91c-.56-.1-1.16.03-1.56.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.82c0-.6.24-1.17.66-1.59l6.5-6.5c.4-.4.52-1 .43-1.56A6 6 0 1 1 21.75 8.25Z" />
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

function TokenIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6l6 6v10a2 2 0 0 1-2 2Z" />
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

function CheckIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}

function AlertIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 4.3 2.7 18a2 2 0 0 0 1.8 3h15a2 2 0 0 0 1.8-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
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