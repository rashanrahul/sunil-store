
import { useState } from 'react'
import { supabase } from './lib/supabase'

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (loginError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } =
      await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

    if (profileError || profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('You are not authorized as an admin.')
      setLoading(false)
      return
    }

    setLoading(false)
    onLogin()
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl shadow-green-900/10 sm:p-8">
        <h1 className="text-center text-2xl font-bold text-green-800 sm:text-3xl">
          Sunil Store
        </h1>

        <p className="mb-7 mt-2 text-center text-gray-500 sm:mb-8">
          Admin Login
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-12 w-full rounded-lg border p-3"
              placeholder="Admin email"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-12 w-full rounded-lg border p-3"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-lg bg-green-700 py-3 font-bold text-white transition-colors hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
