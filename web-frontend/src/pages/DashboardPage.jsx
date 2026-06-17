import { useMemo } from 'react';

const summaryTiles = [
  { title: 'Rides today', value: '24', details: 'Active ride requests currently in progress' },
  { title: 'Drivers online', value: '16', details: 'Drivers available for immediate dispatch' },
  { title: 'Earnings', value: '$3,820', details: 'Estimated daily revenue for the fleet' },
];

const messages = [
  { id: 1, title: 'Welcome back!', body: 'Your EasyGo dashboard is ready for development and testing.' },
  { id: 2, title: 'Next step', body: 'Use the routes to navigate between pages and expand the app with real data.' },
];

function DashboardPage() {
  const tileCards = useMemo(
    () => summaryTiles.map((tile) => (
      <div key={tile.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900">{tile.title}</h3>
        <p className="mt-3 text-4xl font-bold text-slate-900">{tile.value}</p>
        <p className="mt-4 text-sm text-slate-600">{tile.details}</p>
      </div>
    )),
    [],
  );

  return (
    <section className="space-y-10">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">User Dashboard</h1>
        <p className="mt-3 text-slate-600">This page is a demo dashboard for EasyGo users and managers.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">{tileCards}</div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
          <ul className="mt-4 space-y-4 text-slate-600">
            <li>Driver Jorge accepted a new ride in 3 minutes.</li>
            <li>Customer Marta requested a pickup from downtown.</li>
            <li>System performed a nightly data sync successfully.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Quick links</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">Manage rides</span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">Driver roster</span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">Reports</span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">Settings</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Inbox</h2>
        <div className="mt-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="rounded-3xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{message.title}</p>
              <p className="mt-1 text-slate-600">{message.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
