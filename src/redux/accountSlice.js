import { createSlice } from '@reduxjs/toolkit'

// Safely read persisted account from localStorage (if available)
const loadAccountFromLocalStorage = () => {
    try {
        const raw = localStorage.getItem('account')
        return raw ? JSON.parse(raw) : null
    } catch {
        // If parsing fails, clear the broken value and return null
        try { localStorage.removeItem('account') } catch { /* ignore */ };
        return null
    }
}

const initialState = loadAccountFromLocalStorage()

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        // Store the full account payload and persist it to localStorage so
        // the login state survives page refreshes.
        login: (state, action) => {
            const next = action.payload
            try {
                localStorage.setItem('account', JSON.stringify(next))
            } catch {
                // ignore localStorage failures (e.g., quota, disabled)
            }
            return next
        },
        // Clear account in state and localStorage on logout
        logout: () => {
            try {
                localStorage.removeItem('account')
            } catch { /* ignore */ }
            return null;
        },
    },
})

// Action creators are generated for each case reducer function
export const { login, logout } = accountSlice.actions

export default accountSlice.reducer