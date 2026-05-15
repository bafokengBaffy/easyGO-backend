import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Reliable ride requests',
    description: 'Create and manage routes, bookings, and driver assignments from one dashboard.',
  },
  {
    title: 'Real-time tracking',
    description: 'Monitor rides, locations, and status updates in real time for every passenger.',
  },
  {
    title: 'User-friendly dashboard',
    description: 'A clean user interface built for both riders and fleet managers.',
  },
];

function LandingPage() {
  return (
    <section className="space-y-10 py-8">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-10 text-white shadow-2xl shadow-slate-300/10 sm:p-14">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-300">EasyGo platform</p>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">Build modern ride and fleet experiences fast.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-200">
            EasyGo gives you a complete frontend experience for landing, authentication, and user dashboards built on React, Vite, and Tailwind CSS.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{feature.title}</h2>
            <p className="mt-3 text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Fast development-ready pages.</h2>
            <p className="mt-4 text-slate-600">
              This frontend is ready for development mode with routing, tests, and a frontend backend health check. Add your own data and APIs to extend the app.
            </p>
          </div>
          <div className="space-y-3 text-slate-600">
            <p>• Landing page with calls to action</p>
            <p>• Login and registration flows</p>
            <p>• Dashboard user page and profile preview</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingPage;
