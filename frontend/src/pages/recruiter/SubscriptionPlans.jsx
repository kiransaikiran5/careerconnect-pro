import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

export default function SubscriptionPlans() {
  const { user } = useContext(AuthContext);

  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(true);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);

  const userRole = String(user?.role || '').toUpperCase();
  const isRecruiter = userRole === 'RECRUITER';

  const currentPlanId = currentSub?.plan_id;

  const currentPlan = useMemo(() => {
    return plans.find((plan) => Number(plan.id) === Number(currentPlanId)) || null;
  }, [plans, currentPlanId]);

  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);

      const res = await api.get('/plans');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.plans)
          ? res.data.plans
          : [];

      setPlans(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load subscription plans.');
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const fetchMySub = useCallback(async () => {
    try {
      setSubLoading(true);

      const res = await api.get('/subscriptions/my');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.subscriptions)
          ? res.data.subscriptions
          : [];

      const active = list.find((subscription) => subscription.is_active);

      setCurrentSub(active || null);
    } catch {
      setCurrentSub(null);
    } finally {
      setSubLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchMySub();
  }, [fetchPlans, fetchMySub]);

  const handleSubscribe = async (planId) => {
    if (!isRecruiter) {
      toast.error('Only recruiters can subscribe to plans.');
      return;
    }

    try {
      setCheckoutLoadingId(planId);

      const res = await api.post(`/payments/checkout/${planId}`);

      const checkoutUrl =
        res.data?.checkout_url ||
        res.data?.payment_url ||
        res.data?.url ||
        '';

      if (checkoutUrl) {
        toast.success('Redirecting to checkout...');
        window.location.href = checkoutUrl;
        return;
      }

      toast.success(res.data?.message || 'Subscription activated!');
      await fetchMySub();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment failed.');
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchPlans(), fetchMySub()]);
    toast.success('Plans refreshed.');
  };

  const loading = plansLoading || subLoading;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Recruiter Billing
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Subscription Plans
              </h1>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Choose a plan, complete checkout, and activate recruiter hiring features.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:flex">
              <MiniStat label="Plans" value={loading ? '...' : plans.length} />
              <MiniStat
                label="Current"
                value={subLoading ? '...' : currentPlan?.name || 'None'}
              />

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Current plan */}
        <div className="mb-5">
          {subLoading ? (
            <CurrentPlanSkeleton />
          ) : currentSub && currentPlan ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                    Active Subscription
                  </p>

                  <h2 className="mt-1 text-xl font-black text-emerald-950">
                    {currentPlan.name}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    Expires on {formatDate(currentSub.end_date)}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-700 shadow-sm">
                  Active
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-sm font-black text-amber-900">
                No active subscription
              </p>

              <p className="mt-1 text-sm font-semibold text-amber-700">
                Select a plan below to continue with checkout.
              </p>
            </div>
          )}
        </div>

        {/* Plans */}
        {plansLoading ? (
          <PlansSkeleton />
        ) : plans.length === 0 ? (
          <EmptyPlans />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = Number(plan.id) === Number(currentPlanId);
              const isProcessing = Number(checkoutLoadingId) === Number(plan.id);

              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={isCurrent}
                  isProcessing={isProcessing}
                  isRecruiter={isRecruiter}
                  onSubscribe={handleSubscribe}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 max-w-28 truncate text-lg font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function PlanCard({ plan, isCurrent, isProcessing, isRecruiter, onSubscribe }) {
  const price = Number(plan.price || 0);
  const jobLimit = Number(plan.job_posting_limit ?? 0);

  return (
    <div
      className={`relative flex min-h-full flex-col rounded-3xl border bg-white p-5 shadow-lg shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-xl ${
        isCurrent
          ? 'border-indigo-300 ring-4 ring-indigo-100'
          : 'border-slate-200'
      }`}
    >
      {isCurrent && (
        <span className="absolute right-4 top-4 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
          Current
        </span>
      )}

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-50 to-cyan-50 text-2xl ring-1 ring-indigo-100">
        {getPlanIcon(plan.name)}
      </div>

      <h3 className="text-xl font-black text-slate-950">
        {plan.name || 'Plan'}
      </h3>

      <p className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-500">
        {plan.description || 'A flexible plan for recruiter hiring needs.'}
      </p>

      <p className="mt-5 text-4xl font-black tracking-tight text-slate-950">
        {price <= 0 ? 'Free' : `$${price}`}
        {price > 0 && (
          <span className="text-sm font-bold text-slate-400">
            /mo
          </span>
        )}
      </p>

      <div className="mt-5 flex-1 space-y-2">
        <FeatureItem>
          {jobLimit === -1 ? 'Unlimited' : jobLimit} Job Posts
        </FeatureItem>

        <FeatureItem>
          {plan.is_featured ? 'Featured Jobs Included' : 'Standard Job Visibility'}
        </FeatureItem>

        <FeatureItem>
          {plan.priority_support ? 'Priority Support' : 'Basic Support'}
        </FeatureItem>
      </div>

      <button
        type="button"
        onClick={() => onSubscribe(plan.id)}
        disabled={isCurrent || isProcessing || !isRecruiter}
        className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-black transition ${
          isCurrent
            ? 'cursor-not-allowed bg-slate-200 text-slate-500'
            : !isRecruiter
              ? 'cursor-not-allowed bg-slate-200 text-slate-500'
              : 'bg-linear-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 hover:shadow-indigo-500/40'
        }`}
      >
        {isCurrent
          ? 'Current Plan'
          : isProcessing
            ? 'Opening Checkout...'
            : !isRecruiter
              ? 'Recruiter Only'
              : 'Checkout'}
      </button>
    </div>
  );
}

function FeatureItem({ children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
        ✓
      </span>

      <span className="text-sm font-bold text-slate-700">
        {children}
      </span>
    </div>
  );
}

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60"
        >
          <div className="h-12 w-12 animate-pulse rounded-3xl bg-slate-200" />
          <div className="mt-4 h-6 w-36 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 h-10 w-28 animate-pulse rounded bg-slate-200" />

          <div className="mt-5 space-y-2">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-11 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>

          <div className="mt-6 h-12 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function CurrentPlanSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-6 w-52 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

function EmptyPlans() {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-3xl shadow-sm">
          📦
        </div>

        <h3 className="mt-4 text-xl font-black text-slate-950">
          No plans available
        </h3>

        <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
          Subscription plans will appear here after admin creates them.
        </p>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function getPlanIcon(name) {
  const planName = String(name || '').toLowerCase();

  if (planName.includes('basic')) return '🌱';
  if (planName.includes('pro')) return '🚀';
  if (planName.includes('premium')) return '👑';
  if (planName.includes('enterprise')) return '🏢';

  return '💼';
}

function formatDate(value) {
  if (!value) return 'Date not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}