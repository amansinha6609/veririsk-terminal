import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

// Check both the environment variable and a hardcoded string just in case
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_ZGV2ZWxvcGVkLW11bGV0LTM3LmNsZXJrLmFjY291bnRzLmRldiQ'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    ) : (
      <div className="h-screen bg-[#051121] text-white flex items-center justify-center p-10 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4 text-red-500">Configuration Error</h1>
          <p className="text-gray-400">VITE_CLERK_PUBLISHABLE_KEY is missing from .env</p>
        </div>
      </div>
    )}
  </React.StrictMode>,
)
