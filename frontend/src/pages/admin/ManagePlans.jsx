import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const initialForm = {
  name: '',
  price: 0,
  job_posting_limit: 1,
  is_featured: false,
  priority_support: false,
  description: '',
};

export default function ManagePlans() {
  const formRef = useRef(null);

  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isEditing = Boolean(editingId);

  const totalPlans = plans.length;

  const premiumPlans = useMemo(() => {
    return plans.filter((plan) => plan.is_featured || plan.priority_support).length;
  }, [plans]);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/plans');
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.plans)
          ? res.data.plans
          : [];
      setPlans(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load plans.');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error('Plan name is required.');
      return false;
    }
    if (Number(form.price) < 0) {
      toast.error('Price cannot be negative.');
      return false;
    }
    if (Number(form.job_posting_limit) < -1) {
      toast.error('Job posting limit must be -1 or greater.');
      return false;
    }
    return true;
  };

  const buildPayload = () => {
    return {
      name: form.name.trim(),
      price: Number(form.price || 0),
      job_posting_limit: Number(form.job_posting_limit || 0),
      is_featured: Boolean(form.is_featured),
      priority_support: Boolean(form.priority_support),
      description: form.description.trim(),
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      const payload = buildPayload();
      if (isEditing) {
        await api.put(`/plans/${editingId}`, payload);
        toast.success('Plan updated successfully.');
      } else {
        await api.post('/plans', payload);
        toast.success('Plan created successfully.');
      }
      resetForm();
      await fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Unable to save plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name || '',
      price: Number(plan.price || 0),
      job_posting_limit: Number(plan.job_posting_limit ?? 1),
      is_featured: Boolean(plan.is_featured),
      priority_support: Boolean(plan.priority_support),
      description: plan.description || '',
    });
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this plan?');
    if (!confirmed) return;
    try {
      setDeletingId(id);
      await api.delete(`/plans/${id}`);
      toast.success('Plan deleted successfully.');
      if (editingId === id) {
        resetForm();
      }
      await fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = async () => {
    await fetchPlans();
    toast.success('Plans refreshed.');
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-4 sm:px-6 lg:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header – more compact */}
        <div className="mb-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
          <div className="bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 px-4 py-4 text-white sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-indigo-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Admin Billing Control
                </div>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Manage Subscription Plans
                </h1>
                <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-slate-300">
                  Create recruiter plans, set job posting limits, enable featured jobs, and manage priority support.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
                <SummaryBox label="Total Plans" value={loading ? '...' : totalPlans} />
                <SummaryBox label="Premium Plans" value={loading ? '...' : premiumPlans} />
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950 shadow-md shadow-black/10 transition hover:-translate-y-0.5 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.2fr]">
          {/* Form – reduced padding */}
          <div
            ref={formRef}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/30 sm:p-5"
          >
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {isEditing ? 'Edit Plan' : 'Create Plan'}
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                {isEditing ? 'Update Subscription Plan' : 'New Subscription Plan'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <InputField
                label="Plan Name"
                type="text"
                placeholder="Basic, Pro, Premium"
                value={form.name}
                onChange={(value) => updateField('name', value)}
                required
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <InputField
                  label="Price"
                  type="number"
                  placeholder="0"
                  value={form.price}
                  onChange={(value) => updateField('price', value === '' ? 0 : Number(value))}
                  min="0"
                  step="0.01"
                />
                <InputField
                  label="Job Posting Limit"
                  type="number"
                  placeholder="-1 for unlimited"
                  value={form.job_posting_limit}
                  onChange={(value) =>
                    updateField('job_posting_limit', value === '' ? 0 : Number(value))
                  }
                  min="-1"
                  step="1"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-black text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  rows={3}
                  placeholder="Write short details about this plan..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <ToggleCard
                  label="Featured Jobs"
                  description="Allow jobs to appear as featured listings."
                  checked={form.is_featured}
                  onChange={(checked) => updateField('is_featured', checked)}
                />
                <ToggleCard
                  label="Priority Support"
                  description="Give recruiters faster support handling."
                  checked={form.priority_support}
                  onChange={(checked) => updateField('priority_support', checked)}
                />
              </div>

              <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting
                    ? 'Saving...'
                    : isEditing
                      ? 'Update Plan'
                      : 'Create Plan'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Plan List – reduced padding and card height */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/30 sm:p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Available Plans
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Subscription Plans
                </h2>
              </div>
              <p className="text-sm font-semibold text-slate-500">
                {loading ? 'Loading...' : `${plans.length} plans found`}
              </p>
            </div>

            {loading ? (
              <PlansSkeleton />
            ) : plans.length === 0 ? (
              <EmptyPlans />
            ) : (
              <div className="grid gap-3 xl:grid-cols-2">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isEditing={editingId === plan.id}
                    deleting={deletingId === plan.id}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS (compact versions) ================= */

function SummaryBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
      <p className="text-[10px] font-bold text-slate-300">{label}</p>
      <p className="mt-0.5 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  min,
  step,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-black text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        min={min}
        step={step}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}

function ToggleCard({ label, description, checked, onChange }) {
  return (
    <label
      className={`cursor-pointer rounded-2xl border p-3 transition ${
        checked
          ? 'border-indigo-300 bg-indigo-50 ring-4 ring-indigo-100'
          : 'border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-white'
      }`}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-indigo-600"
        />
        <div>
          <p className="text-sm font-black text-slate-800">{label}</p>
          <p className="mt-1 text-xs font-semibold leading-4 text-slate-500">{description}</p>
        </div>
      </div>
    </label>
  );
}

function PlanCard({ plan, isEditing, deleting, onEdit, onDelete }) {
  const price = Number(plan.price || 0);
  const jobLimit = Number(plan.job_posting_limit ?? 0);
  return (
    <div
      className={`rounded-2xl border p-3 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/80 ${
        isEditing
          ? 'border-indigo-300 bg-indigo-50 ring-4 ring-indigo-100'
          : 'border-slate-200 bg-slate-50 hover:bg-white'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-slate-200">
            {getPlanIcon(plan.name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-950">{plan.name || 'Plan'}</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              {price <= 0 ? 'Free' : `$${price}/mo`}
            </p>
          </div>
        </div>
        {isEditing && (
          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
            Editing
          </span>
        )}
      </div>
      <p className="line-clamp-2 min-h-8 text-xs font-semibold leading-5 text-slate-500">
        {plan.description || 'No description added.'}
      </p>
      <div className="mt-2 space-y-1.5">
        <PlanFeature>{jobLimit === -1 ? 'Unlimited' : jobLimit} Job Posts</PlanFeature>
        <PlanFeature>{plan.is_featured ? 'Featured Jobs Enabled' : 'Standard Visibility'}</PlanFeature>
        <PlanFeature>{plan.priority_support ? 'Priority Support Enabled' : 'Basic Support'}</PlanFeature>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(plan)}
          className="flex-1 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-black text-indigo-700 transition hover:bg-indigo-100"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(plan.id)}
          disabled={deleting}
          className="flex-1 rounded-xl bg-red-50 px-3 py-2 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

function PlanFeature({ children }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-2 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
        ✓
      </span>
      <span>{children}</span>
    </div>
  );
}

function PlansSkeleton() {
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex gap-2">
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200" />
            <div className="flex-1">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-1 h-3 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-1 h-3 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 space-y-1.5">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-6 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-8 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-8 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyPlans() {
  return (
    <div className="flex min-h-60 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
          📦
        </div>
        <h3 className="mt-2 text-lg font-black text-slate-950">No plans created yet</h3>
        <p className="mt-1 max-w-md text-xs font-semibold leading-5 text-slate-500">
          Create your first subscription plan using the form on the left.
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