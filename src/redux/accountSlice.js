import { createSlice } from '@reduxjs/toolkit'

// Safely read persisted account from storage
const readJSON = (storage, key) => {
    try {
        const raw = storage.getItem(key)
        return raw ? JSON.parse(raw) : null
    } catch {
        // If parsing fails, clear the broken value and return null
        try { storage.removeItem(key) } catch { /* ignore */ };
        return null
    }
}

const loadAccount = () => {
    // Prefer sessionStorage (keeps login on refresh),
    // fall back to localStorage when user chose "Remember me".
    const fromSession = readJSON(sessionStorage, 'account')
    if (fromSession) return fromSession
    const fromLocal = readJSON(localStorage, 'account')
    return fromLocal
}

// Khi Redux khởi tạo, nạp dữ liệu login cũ từ sessionStorage (ưu tiên) hoặc localStorage
const initialState = loadAccount();

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        // Store the full account payload. Default: sessionStorage (persists across refresh only).
        // If action.payload.remember === true, also persist to localStorage ("Remember me").
        login: (state, action) => {
            const next = action.payload
            try {
                // Default persistence: session only
                sessionStorage.setItem('account', JSON.stringify(next))
                // Optional long-term persistence
                if (next && next.remember) {
                    localStorage.setItem('account', JSON.stringify(next))
                } else {
                    // Ensure previous remembered login doesn't linger
                    try { localStorage.removeItem('account') } catch { /* ignore */ }
                }
            } catch {
                // ignore localStorage failures (e.g., quota, disabled)
            }
            return next
        },
        // Clear account in state and localStorage on logout
        logout: () => {
            try {
                sessionStorage.removeItem('account')
                localStorage.removeItem('account')
            } catch { /* ignore */ }
            return null;
        },
    },
})

// Action creators are generated for each case reducer function
export const { login, logout } = accountSlice.actions

export default accountSlice.reducer