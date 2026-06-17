import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authenticateUser } from '../services/authService';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await authenticateUser({ email, password });

    if (result.success) {
      setMessage('Login successful! Redirect to dashboard when implemented.');
      return;
    }

    setMessage(result.message);
  };

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Sign in to EasyGo</h1>
        <p className="mt-3 text-slate-600">Use the development demo credentials to explore the user dashboard.</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Sign in
          </button>

          {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
        </form>

        <p className="mt-6 text-sm text-slate-600">
          New to EasyGo?{' '}
          <Link className="font-semibold text-slate-900 hover:text-slate-700" to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
