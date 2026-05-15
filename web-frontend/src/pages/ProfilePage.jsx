import { useEffect, useState } from 'react';
import { getUserProfile } from '../services/userService';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getUserProfile();
        if (response.success) {
          setProfile(response.profile);
          return;
        }
        setError(response.message || 'Unable to load profile');
      } catch (fetchError) {
        setError('Unable to connect to backend');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Your profile</h1>
        <p className="mt-3 text-slate-600">View your demo user profile and account details.</p>
      </div>

      {loading && (
        <div className="rounded-3xl bg-slate-50 p-8 shadow-sm">
          <p className="text-slate-700">Loading profile…</p>
        </div>
      )}

      {error && (
        <div className="rounded-3xl bg-red-50 p-8 shadow-sm border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {profile && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Profile details</h2>
            <div className="mt-6 space-y-4 text-slate-700">
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="mt-1 text-lg font-medium text-slate-900">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 text-lg font-medium text-slate-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Role</p>
                <p className="mt-1 text-lg font-medium text-slate-900">{profile.role}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Account activity</h2>
            <div className="mt-6 space-y-4 text-slate-700">
              <div>
                <p className="text-sm text-slate-500">Last signed in</p>
                <p className="mt-1 text-lg font-medium text-slate-900">{profile.lastLogin}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="mt-1 text-lg font-medium text-slate-900">{profile.location}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="mt-1 text-lg font-medium text-slate-900">{profile.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProfilePage;
