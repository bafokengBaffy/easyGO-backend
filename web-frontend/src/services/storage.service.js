export const storageService = {
  setItem: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; } },
  getItem: (key) => { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : null; } catch (e) { return null; } },
  removeItem: (key) => { localStorage.removeItem(key); },
  clear: () => { localStorage.clear(); },
  hasItem: (key) => localStorage.getItem(key) !== null,
};
