import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm text-center">
      <h1 className="text-4xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-4 text-slate-600">The page you are looking for does not exist. Use the navigation to return to the home page.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Return home
      </Link>
    </section>
  );
}

export default NotFoundPage;
