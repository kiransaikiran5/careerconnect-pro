import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoiceLoadingId, setInvoiceLoadingId] = useState(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get('/payments/history');

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.payments)
          ? res.data.payments
          : [];

      setPayments(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load payment history.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const viewInvoice = async (paymentId) => {
    try {
      setInvoiceLoadingId(paymentId);

      const res = await api.get(`/payments/invoice/${paymentId}`);
      setSelectedInvoice(res.data || null);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not load invoice.');
    } finally {
      setInvoiceLoadingId(null);
    }
  };

  const closeInvoice = () => {
    setSelectedInvoice(null);
  };

  const totalPaid = payments.reduce((total, payment) => {
    return total + Number(payment.amount || 0);
  }, 0);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Compact Header */}
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Billing Records
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Payment History
              </h1>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                View subscription payments and invoice details.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:flex">
              <MiniStat label="Payments" value={loading ? '...' : payments.length} />
              <MiniStat label="Total Paid" value={loading ? '...' : formatMoney(totalPaid)} />

              <button
                type="button"
                onClick={fetchPayments}
                disabled={loading}
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Transactions
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Recent Payments
              </h2>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
              {loading ? 'Loading...' : `${payments.length} Records`}
            </span>
          </div>

          {loading ? (
            <PaymentSkeleton />
          ) : payments.length === 0 ? (
            <EmptyPayments />
          ) : (
            <div className="max-h-[calc(100vh-250px)] overflow-auto rounded-3xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead align="right">Invoice</TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="transition hover:bg-indigo-50/40">
                      <td className="px-5 py-4">
                        <p className="max-w-56 truncate text-sm font-black text-slate-900">
                          {payment.transaction_id || `TXN-${payment.id}`}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          Payment ID: {payment.id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-black text-slate-800">
                        {formatMoney(payment.amount)}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        {formatDate(payment.payment_date)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={payment.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => viewInvoice(payment.id)}
                          disabled={invoiceLoadingId === payment.id}
                          className="rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {invoiceLoadingId === payment.id ? 'Loading...' : 'View Invoice'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedInvoice && (
          <InvoiceModal invoice={selectedInvoice} onClose={closeInvoice} />
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

      <p className="mt-0.5 text-lg font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function TableHead({ children, align = 'left' }) {
  return (
    <th
      className={`px-5 py-3 text-${align} text-xs font-black uppercase tracking-widest text-slate-400`}
    >
      {children}
    </th>
  );
}

function StatusBadge({ status }) {
  const value = String(status || 'SUCCESS').toUpperCase();

  const className =
    value === 'SUCCESS' || value === 'PAID'
      ? 'bg-emerald-100 text-emerald-700'
      : value === 'FAILED'
        ? 'bg-red-100 text-red-700'
        : value === 'PENDING'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-slate-100 text-slate-700';

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${className}`}>
      {formatLabel(value)}
    </span>
  );
}

function InvoiceModal({ invoice, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-4xl bg-white shadow-2xl">
        <div className="bg-linear-to-br from-slate-950 via-indigo-950 to-slate-900 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-200">
                Invoice Details
              </p>

              <h2 className="mt-1 text-2xl font-black">
                #{invoice.transaction_id || 'Invoice'}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-black text-white transition hover:bg-white/20"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-3">
            <InvoiceRow label="Date" value={formatDate(invoice.payment_date)} />
            <InvoiceRow label="Plan" value={invoice.plan_name || 'Not available'} />
            <InvoiceRow label="Amount" value={formatMoney(invoice.amount)} />
            <InvoiceRow label="Company" value={invoice.company_name || 'Not available'} />
            <InvoiceRow label="Email" value={invoice.recruiter_email || 'Not available'} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
          >
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoiceRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-sm font-black text-slate-500">
        {label}
      </p>

      <p className="text-right text-sm font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function PaymentSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-28 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyPayments() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-2xl shadow-sm">
          💳
        </div>

        <h3 className="mt-3 text-lg font-black text-slate-950">
          No payments found
        </h3>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          Your subscription payment history will appear here.
        </p>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function formatMoney(value) {
  const amount = Number(value || 0);

  return `$${amount.toFixed(2)}`;
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

function formatLabel(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}