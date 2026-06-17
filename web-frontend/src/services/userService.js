const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api/v1';

async function callJson(path) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  return {
    success: response.ok,
    ...data,
  };
}

export async function getUserProfile() {
  return callJson('/users/profile');
}
