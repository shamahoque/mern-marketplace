// Browser storage holding JSON values (D-12).
// The cart and sign-in helpers used to repeat the same steps in every method:
// check `typeof window` (no storage during server-side rendering), read the key,
// JSON.parse it, and JSON.stringify it back. This module does that once.

const inBrowser = () => typeof window !== 'undefined'

const jsonStore = (getStorage) => ({
  // False during server-side rendering, where there is no storage.
  available: inBrowser,

  // The stored value, or `fallback` when the key is empty or storage is unavailable.
  read (key, fallback) {
    if (!inBrowser()) return fallback
    const raw = getStorage().getItem(key)
    return raw ? JSON.parse(raw) : fallback
  },

  write (key, value) {
    if (inBrowser()) getStorage().setItem(key, JSON.stringify(value))
  },

  remove (key) {
    if (inBrowser()) getStorage().removeItem(key)
  }
})

// Kept across visits: the shopping cart.
export const local = jsonStore(() => localStorage)
// Cleared when the tab closes: the signed-in user's token.
export const session = jsonStore(() => sessionStorage)
