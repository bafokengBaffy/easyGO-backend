const bookings = [
  {
    id: 'BG-001',
    pickup: 'City Center',
    dropoff: 'Airport',
    time: 'Today, 9:45 AM',
    status: 'Confirmed',
  },
  {
    id: 'BG-002',
    pickup: 'North Station',
    dropoff: 'Central Park',
    time: 'Today, 11:30 AM',
    status: 'Pending',
  },
  {
    id: 'BG-003',
    pickup: 'Eastside Mall',
    dropoff: 'Hotel District',
    time: 'Today, 2:15 PM',
    status: 'Completed',
  },
];

function BookingsPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Your bookings</h1>
        <p className="mt-3 text-slate-600">Manage current and recent rides booked through EasyGo.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-5 text-sm font-semibold uppercase tracking-wide text-slate-500">Ride history</div>
        <div className="divide-y divide-slate-200">
          {bookings.map((booking) => (
            <div key={booking.id} className="px-6 py-5 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">{booking.pickup} → {booking.dropoff}</p>
                <p className="mt-1 text-sm text-slate-600">{booking.time}</p>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 sm:mt-0">
                {booking.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BookingsPage;
