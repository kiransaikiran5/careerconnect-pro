import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

export default function Reviews() {
  const { type, id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [targetName, setTargetName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [targetLoading, setTargetLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isCompany = type === 'company';
  const isRecruiter = type === 'recruiter';
  const isValidType = isCompany || isRecruiter;

  const averageRating = useMemo(() => {
    if (!reviews.length) return null;

    const total = reviews.reduce((sum, review) => {
      return sum + Number(review.rating || 0);
    }, 0);

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const fetchReviews = useCallback(async () => {
    if (!isValidType || !id) return;

    try {
      setLoading(true);

      const endpoint = isCompany
        ? `/reviews/company/${id}`
        : `/reviews/recruiter/${id}`;

      const res = await api.get(endpoint);

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.reviews)
          ? res.data.reviews
          : [];

      setReviews(list);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load reviews.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [id, isCompany, isValidType]);

  const fetchTargetName = useCallback(async () => {
    if (!isValidType || !id) return;

    try {
      setTargetLoading(true);

      if (isCompany) {
        const res = await api.get(`/companies/${id}`);
        setTargetName(res.data?.name || `Company #${id}`);
      } else {
        const res = await api.get(`/recruiters/${id}`);

        setTargetName(
          res.data?.name ||
            res.data?.full_name ||
            res.data?.email ||
            res.data?.user?.email ||
            `Recruiter #${id}`
        );
      }
    } catch {
      setTargetName(isCompany ? `Company #${id}` : `Recruiter #${id}`);
    } finally {
      setTargetLoading(false);
    }
  }, [id, isCompany, isValidType]);

  useEffect(() => {
    if (!isValidType) {
      setLoading(false);
      setTargetLoading(false);
      return;
    }

    fetchReviews();
    fetchTargetName();
  }, [fetchReviews, fetchTargetName, isValidType]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error('Please login to leave a review.');
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write your review comment.');
      return;
    }

    if (!isValidType) {
      toast.error('Invalid review type.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        rating: Number(rating),
        comment: comment.trim(),
      };

      if (isCompany) {
        payload.company_id = Number(id);
      } else {
        payload.recruiter_id = Number(id);
      }

      await api.post('/reviews', payload);

      toast.success('Review submitted successfully.');

      setRating(5);
      setComment('');

      await fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isValidType) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h2 className="text-xl font-black text-red-800">
            Invalid Review Page
          </h2>

          <p className="mt-2 text-sm font-semibold text-red-600">
            Use /reviews/company/:id or /reviews/recruiter/:id.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {isCompany ? 'Company Reviews' : 'Recruiter Reviews'}
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Reviews for {targetLoading ? 'Loading...' : targetName}
              </h1>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Read feedback and share your experience.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <MiniStat
                label="Average"
                value={averageRating ? `${averageRating}/5` : 'No rating'}
              />

              <MiniStat
                label="Reviews"
                value={loading ? '...' : reviews.length}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          {/* Review Form */}
          <div className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Write Feedback
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Write a Review
              </h2>
            </div>

            {user ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Rating
                  </label>

                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((number) => (
                      <button
                        key={number}
                        type="button"
                        onClick={() => setRating(number)}
                        className={`rounded-2xl border px-3 py-3 text-sm font-black transition ${
                          Number(rating) === number
                            ? 'border-amber-300 bg-amber-50 text-amber-700 ring-4 ring-amber-100'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'
                        }`}
                      >
                        {number}★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Comment
                  </label>

                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={5}
                    maxLength={500}
                    placeholder="Share your experience..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />

                  <p className="mt-1 text-right text-xs font-bold text-slate-400">
                    {comment.length}/500
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="w-full rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-black text-amber-900">
                  Login required
                </p>

                <p className="mt-1 text-sm font-semibold text-amber-700">
                  Please login to leave a review.
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="mt-4 rounded-2xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-amber-700"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>

          {/* Review List */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  All Reviews
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Feedback List
                </h2>
              </div>

              <button
                type="button"
                onClick={fetchReviews}
                disabled={loading}
                className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {loading ? (
              <ReviewSkeleton />
            ) : reviews.length === 0 ? (
              <EmptyReviews />
            ) : (
              <div className="grid max-h-[calc(100vh-250px)] gap-3 overflow-y-auto pr-1">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
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

function ReviewCard({ review }) {
  const rating = Number(review.rating || 0);
  const reviewerName = getReviewerName(review);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white hover:shadow-md">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-lg">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= rating ? 'text-amber-400' : 'text-slate-300'}
              >
                ★
              </span>
            ))}
          </div>

          <p className="mt-1 text-xs font-black text-slate-500">
            {reviewerName}
          </p>
        </div>

        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">
          {formatDate(review.created_at)}
        </span>
      </div>

      <p className="text-sm font-semibold leading-6 text-slate-700">
        {review.comment || 'No comment added.'}
      </p>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="grid gap-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function EmptyReviews() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-2xl shadow-sm">
          ⭐
        </div>

        <h3 className="mt-3 text-lg font-black text-slate-950">
          No reviews yet
        </h3>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          Be the first one to share feedback.
        </p>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

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

function getReviewerName(review) {
  const email =
    review.user_email ||
    review.reviewer_email ||
    review.email ||
    review.user?.email ||
    review.reviewer?.email ||
    review.created_by?.email ||
    '';

  if (email && email.includes('@')) {
    return email.split('@')[0];
  }

  return (
    review.user_name ||
    review.reviewer_name ||
    review.user?.name ||
    review.reviewer?.name ||
    'Anonymous User'
  );
}