import { Link } from 'react-router-dom';

const tips = [
  {
    title: 'Use a clear professional summary',
    description:
      'Write 2 to 3 lines about your skills, role target, and career goal. Keep it simple and job-focused.',
  },
  {
    title: 'Add strong technical skills',
    description:
      'Mention skills like React, FastAPI, MySQL, Python, JavaScript, Tailwind CSS, SAP, or tools you actually know.',
  },
  {
    title: 'Write project details properly',
    description:
      'For each project, add title, tech stack, features, your role, and the result. Projects are very important for freshers.',
  },
  {
    title: 'Use action words',
    description:
      'Start points with words like Developed, Designed, Created, Implemented, Integrated, Improved, or Built.',
  },
  {
    title: 'Keep resume one page',
    description:
      'For freshers, one page is best. Keep only useful education, skills, projects, internship, and certifications.',
  },
  {
    title: 'Avoid spelling and grammar mistakes',
    description:
      'Check spelling, spacing, alignment, and date format before uploading your resume.',
  },
];

const samplePoints = [
  'Developed a full-stack Job Portal using React, FastAPI, MySQL, and JWT authentication.',
  'Built responsive dashboards for Job Seekers, Recruiters, and Admin users.',
  'Implemented resume upload, job application tracking, interviews, analytics, and notifications.',
  'Designed clean UI pages using Tailwind CSS with role-based protected routing.',
];

export default function ResumeTips() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-linear-to-br from-slate-50 via-white to-indigo-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="relative bg-slate-950 px-5 py-6 text-white sm:px-7">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-8 top-3 h-28 w-28 rounded-full bg-indigo-500/25 blur-3xl" />
              <div className="absolute bottom-0 right-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Guidance
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Resume Tips
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Improve your resume and increase interview chances with clean structure, strong project points, and better presentation.
                </p>
              </div>

              <Link
                to="/resumes"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Upload Resume
              </Link>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mt-5 grid gap-4 md:grid-cols-2">
          {tips.map((tip, index) => (
            <div
              key={tip.title}
              className="rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-black text-indigo-700">
                  {index + 1}
                </div>

                <div>
                  <h2 className="text-base font-black text-slate-950">
                    {tip.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Sample Resume Points */}
        <section className="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Fresher Project Points
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Sample points you can add in resume
            </h2>
          </div>

          <div className="space-y-3">
            {samplePoints.map((point) => (
              <div
                key={point}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700"
              >
                {point}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-5 rounded-4xl border border-indigo-100 bg-indigo-50 p-5 text-center">
          <h2 className="text-xl font-black text-slate-950">
            Ready to improve your resume?
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Go to the Resumes page, upload your updated resume, and mark the latest one as current.
          </p>

          <Link
            to="/resumes"
            className="mt-5 inline-flex rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5"
          >
            Go to Resumes
          </Link>
        </section>
      </div>
    </div>
  );
}