const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api/v1';

async function postJson(path, body) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return {
    success: response.ok,
    ...data,
  };
}

export async function authenticateUser({ email, password }) {
  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  return postJson('/auth/login', { email, password });
}

export async function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    return { success: false, message: 'Name, email, and password are required.' };
  }

  return postJson('/auth/register', { name, email, password });
}
