// src/pages/notifications/Notifications.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const typeStyles = {
  application_update: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  job_alert: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  interview: 'bg-blue-50 text-blue-700 border-blue-100',
  message: 'bg-purple-50 text-purple-700 border-purple-100',
  general: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const readCount = notifications.length - unreadCount;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get('/notifications/');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setNotifications(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load notifications.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    if (!id) return;

    try {
      setMarkingId(id);

      await api.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );

      toast.success('Notification marked as read.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to mark as read.');
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);

      await api.put('/notifications/read-all');

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
        }))
      );

      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-4">
        {/* HEADER */}
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-slate-950 shadow-xl shadow-slate-200/60">
          <div className="relative px-5 py-5 text-white sm:px-6">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-10 top-0 h-24 w-24 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-12 h-28 w-28 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-white">
                  <BellIcon className="h-6 w-6" />
                </div>

                <div>
                  <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Notification Center
                  </div>

                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Notifications
                  </h1>

                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    Track application updates, interview alerts, and platform messages.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:min-w-96">
                <HeaderStat value={notifications.length} label="Total" />
                <HeaderStat value={unreadCount} label="Unread" />
                <HeaderStat value={readCount} label="Read" />
              </div>
            </div>
          </div>
        </section>

        {/* TOOLBAR */}
        <section className="rounded-4xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
                Inbox
              </p>

              <h2 className="text-xl font-black text-slate-950">
                Latest Updates
              </h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Newest notifications appear first.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fetchNotifications}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing
                  </>
                ) : (
                  <>
                    <RefreshIcon className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {markingAll ? (
                    <>
                      <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                      Updating
                    </>
                  ) : (
                    `Mark all read (${unreadCount})`
                  )}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* LIST */}
        <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          {loading ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl bg-slate-50">
              <div className="text-center">
                <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-indigo-600" />

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  Loading Notifications
                </h3>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Fetching your latest updates...
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex min-h-96 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                  <BellIcon className="h-8 w-8" />
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  No notifications yet
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Application updates, interview alerts, and messages will appear here.
                </p>

                <Link
                  to="/dashboard"
                  className="mt-5 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  markingId={markingId}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function NotificationCard({ notification, markingId, onMarkRead }) {
  const isUnread = !notification.is_read;
  const type = notification.type || 'general';
  const isMarking = markingId === notification.id;

  return (
    <article
      className={`rounded-3xl border p-4 transition ${
        isUnread
          ? 'border-indigo-200 bg-indigo-50/60 shadow-lg shadow-indigo-100/70'
          : 'border-slate-200 bg-slate-50 hover:bg-white'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              isUnread ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'
            }`}
          >
            <BellIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={type} />

              {isUnread && (
                <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                  New
                </span>
              )}
            </div>

            <p
              className={`mt-2 text-sm leading-6 ${
                isUnread
                  ? 'font-black text-slate-950'
                  : 'font-semibold text-slate-600'
              }`}
            >
              {notification.message}
            </p>

            <p className="mt-2 text-xs font-bold text-slate-400">
              {formatDateTime(notification.created_at)}
            </p>
          </div>
        </div>

        {isUnread && (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            disabled={isMarking}
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white px-4 py-2 text-xs font-black text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isMarking ? (
              <>
                <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                Marking
              </>
            ) : (
              'Mark read'
            )}
          </button>
        )}
      </div>
    </article>
  );
}

function TypeBadge({ type }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-black capitalize ${
        typeStyles[type] || typeStyles.general
      }`}
    >
      {formatType(type)}
    </span>
  );
}

function HeaderStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur">
      <p className="text-xl font-black leading-none text-white">{value}</p>

      <p className="mt-1 text-[11px] font-semibold text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* ================= HELPERS ================= */

function formatType(type) {
  if (!type) return 'General';

  return String(type)
    .replaceAll('_', ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDateTime(value) {
  if (!value) return 'Just now';

  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ================= ICONS ================= */

function BellIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17H9m9-1V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2ZM10 20h4" />
    </svg>
  );
}

function RefreshIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8 8 0 0 0-14.9-4M4 5v5h5M4 13a8 8 0 0 0 14.9 4M20 19v-5h-5" />
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