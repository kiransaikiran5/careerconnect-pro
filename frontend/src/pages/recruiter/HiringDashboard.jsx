import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const pipelineStages = [
  {
    key: 'pipeline_applied',
    label: 'Applied',
    icon: '📄',
    barClass: 'bg-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700 ring-blue-100',
  },
  {
    key: 'pipeline_shortlisted',
    label: 'Shortlisted',
    icon: '⭐',
    barClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  {
    key: 'pipeline_interview_scheduled',
    label: 'Interview',
    icon: '🗓️',
    barClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  {
    key: 'pipeline_offered',
    label: 'Offered',
    icon: '🎉',
    barClass: 'bg-purple-500',
    badgeClass: 'bg-purple-50 text-purple-700 ring-purple-100',
  },
  {
    key: 'pipeline_rejected',
    label: 'Rejected',
    icon: '❌',
    barClass: 'bg-red-500',
    badgeClass: 'bg-red-50 text-red-700 ring-red-100',
  },
];

const metricCards = [
  {
    key: 'total_jobs_posted',
    label: 'Active Jobs',
    icon: '💼',
    hint: 'Jobs created by you',
    cardClass: 'from-indigo-50 to-blue-50',
  },
  {
    key: 'total_applications_received',
    label: 'Applications',
    icon: '📥',
    hint: 'Total candidates received',
    cardClass: 'from-cyan-50 to-sky-50',
  },
  {
    key: 'total_shortlisted',
    label: 'Shortlisted',
    icon: '⭐',
    hint: 'Candidates moved ahead',
    cardClass: 'from-amber-50 to-yellow-50',
  },
  {
    key: 'total_interviews_scheduled',
    label: 'Interviews',
    icon: '🗓️',
    hint: 'Scheduled interview rounds',
    cardClass: 'from-emerald-50 to-green-50',
  },
];

export default function HiringDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get('/recruiters/dashboard');
      setData(res.data || {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load hiring dashboard.');
      setData({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const totalPipeline = useMemo(() => {
    if (!data) return 0;

    return pipelineStages.reduce(
      (total, stage) => total + Number(data?.[stage.key] || 0),
      0
    );
  }, [data]);

  const interviewRate = useMemo(() => {
    const applications = Number(data?.total_applications_received || 0);
    const interviews = Number(data?.total_interviews_scheduled || 0);

    if (!applications) return 0;

    return Math.round((interviews / applications) * 100);
  }, [data]);

  const shortlistRate = useMemo(() => {
    const applications = Number(data?.total_applications_received || 0);
    const shortlisted = Number(data?.total_shortlisted || 0);

    if (!applications) return 0;

    return Math.round((shortlisted / applications) * 100);
  }, [data]);

  const handleRefresh = async () => {
    await fetchDashboard();
    toast.success('Hiring dashboard refreshed.');
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 px-6 py-7 text-white sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-indigo-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Recruiter Workspace
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Hiring Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                  Monitor applications, candidate pipeline, interviews, and hiring progress in one place.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <QuickStat label="Shortlist Rate" value={`${shortlistRate}%`} />
                <QuickStat label="Interview Rate" value={`${interviewRate}%`} />

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="rounded-3xl bg-white px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <MetricSkeleton />
            ) : (
              metricCards.map((card) => (
                <MetricCard
                  key={card.key}
                  card={card}
                  value={Number(data?.[card.key] || 0)}
                />
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          {/* Pipeline */}
          <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Candidate Pipeline
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Hiring Progress
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                Total Pipeline: {loading ? '...' : totalPipeline}
              </div>
            </div>

            {loading ? (
              <PipelineSkeleton />
            ) : totalPipeline === 0 ? (
              <EmptyPipeline />
            ) : (
              <div className="space-y-5">
                {pipelineStages.map((stage) => {
                  const value = Number(data?.[stage.key] || 0);
                  const percent = totalPipeline > 0 ? Math.round((value / totalPipeline) * 100) : 0;

                  return (
                    <PipelineRow
                      key={stage.key}
                      stage={stage}
                      value={value}
                      percent={percent}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Snapshot
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Recruitment Summary
            </h2>

            <div className="mt-6 space-y-3">
              <SummaryItem
                label="Jobs Posted"
                value={Number(data?.total_jobs_posted || 0)}
                icon="💼"
                loading={loading}
              />

              <SummaryItem
                label="Applications Received"
                value={Number(data?.total_applications_received || 0)}
                icon="📥"
                loading={loading}
              />

              <SummaryItem
                label="Candidates Shortlisted"
                value={Number(data?.total_shortlisted || 0)}
                icon="⭐"
                loading={loading}
              />

              <SummaryItem
                label="Interviews Scheduled"
                value={Number(data?.total_interviews_scheduled || 0)}
                icon="🗓️"
                loading={loading}
              />
            </div>

            <div className="mt-6 rounded-3xl bg-linear-to-br from-indigo-50 to-cyan-50 p-4 ring-1 ring-indigo-100">
              <h3 className="text-sm font-black text-slate-950">
                Recruiter Tip
              </h3>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Keep candidates updated after shortlisting or interview scheduling. Faster updates improve candidate experience and response rate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function MetricCard({ card, value }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-linear-to-br ${card.cardClass} p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/80`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white text-2xl shadow-sm">
          {card.icon}
        </div>

        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-500 shadow-sm">
          Live
        </span>
      </div>

      <p className="mt-5 text-3xl font-black text-slate-950">
        {value}
      </p>

      <h3 className="mt-1 text-sm font-black text-slate-700">
        {card.label}
      </h3>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        {card.hint}
      </p>
    </div>
  );
}

function PipelineRow({ stage, value, percent }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-lg ring-1 ${stage.badgeClass}`}>
            {stage.icon}
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-800">
              {stage.label}
            </p>

            <p className="text-xs font-semibold text-slate-400">
              {percent}% of pipeline
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
          {value}
        </span>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${stage.barClass} transition-all duration-500`}
          style={{ width: `${percent}%`, minWidth: value > 0 ? '2rem' : '0rem' }}
        />
      </div>
    </div>
  );
}

function QuickStat({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4">
      <p className="text-xs font-bold text-slate-300">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

function SummaryItem({ label, value, icon, loading }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
          {icon}
        </div>

        <p className="text-sm font-black text-slate-700">
          {label}
        </p>
      </div>

      <p className="text-lg font-black text-slate-950">
        {loading ? '...' : value}
      </p>
    </div>
  );
}

function EmptyPipeline() {
  return (
    <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm">
          📊
        </div>

        <h3 className="mt-4 text-xl font-black text-slate-950">
          No pipeline data yet
        </h3>

        <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
          Candidate pipeline will appear after job seekers start applying to your posted jobs.
        </p>
      </div>
    </div>
  );
}

function MetricSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="h-12 w-12 animate-pulse rounded-3xl bg-slate-200" />
          <div className="mt-5 h-8 w-20 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </>
  );
}

function PipelineSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-2xl bg-slate-200" />

              <div>
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-200" />
              </div>
            </div>

            <div className="h-6 w-12 animate-pulse rounded-full bg-slate-200" />
          </div>

          <div className="h-4 animate-pulse rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  );
}