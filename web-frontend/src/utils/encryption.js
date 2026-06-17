export const encryption = {
  hash: async (str) => { const encoder = new TextEncoder(); const data = encoder.encode(str); const hashBuffer = await crypto.subtle.digest('SHA-256', data); const hashArray = Array.from(new Uint8Array(hashBuffer)); return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); },
  encodeBase64: (str) => btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1))),
  decodeBase64: (str) => decodeURIComponent(Array.from(atob(str), c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')),
};
