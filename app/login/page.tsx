'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/SessionContext';
import Image from 'next/image';

const USERS = [
  { username: 'supervisor', password: '321321', role: 'supervisor' },
  { username: 'user', password: '123123', role: 'user' },
];

export default function Login() {
  const router = useRouter();
  const { session, login } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.replace('/');
    }
  }, [session, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const found = USERS.find(u => u.username === username && u.password === password);
      if (found) {
        login(found.username, found.role as 'supervisor' | 'user');
        setError('');
        router.replace('/');
      } else {
        setError('Invalid username or password');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      setLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a192f] via-[#1CAAD9]/30 to-[#f59e42]/10 relative overflow-hidden">
      {/* Decorative blurred gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-tr from-blue-400/40 to-cyan-300/20 rounded-full blur-3xl z-0 animate-float" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-br from-orange-300/30 to-yellow-200/20 rounded-full blur-2xl z-0 animate-float2" />
      <form
        onSubmit={handleLogin}
        className={`relative z-10 w-full max-w-md bg-white/30 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 flex flex-col gap-8 border border-white/40 glass-card ${shake ? 'animate-shake' : ''}`}
        autoComplete="off"
      >
        <div className="flex flex-col items-center gap-2 mb-2">
          <Image src="/unilever-logo.svg" alt="Unilever Logo" width={56} height={56} className="drop-shadow-xl" />
          <span className="text-xs tracking-widest uppercase text-[#1CAAD9] bg-white/60 px-3 py-1 rounded-full mb-1 shadow">i-WMS Login</span>
          <h2 className="text-3xl font-extrabold text-center text-[#1C1C2A] drop-shadow-lg">Welcome Back</h2>
          <p className="text-sm text-gray-500 font-medium">Sign in to your intelligent warehouse</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[#1CAAD9] font-semibold">Username</label>
          <input
            className={`px-4 py-2 rounded-xl bg-white/70 text-[#1C1C2A] border-2 focus:outline-none focus:border-[#1CAAD9] transition-all shadow-inner font-medium placeholder-gray-400 ${error ? 'border-red-400' : 'border-transparent'}`}
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            placeholder="Enter username"
            disabled={loading}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[#1CAAD9] font-semibold">Password</label>
          <input
            type="password"
            className={`px-4 py-2 rounded-xl bg-white/70 text-[#1C1C2A] border-2 focus:outline-none focus:border-[#1CAAD9] transition-all shadow-inner font-medium placeholder-gray-400 ${error ? 'border-red-400' : 'border-transparent'}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={loading}
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" className="accent-blue-400" disabled />
          <label htmlFor="remember" className="text-gray-400 text-sm">Remember me (coming soon)</label>
        </div>
        {error && <div className="text-red-400 text-center font-semibold animate-fadeIn text-base">{error}</div>}
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1CAAD9] to-orange-400 text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-transform text-lg tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              Signing in...
            </span>
          ) : 'Login'}
        </button>
      </form>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(1.04); }
          100% { transform: translateY(0px) scale(1); }
        }
        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
        @keyframes float2 {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-16px) scale(1.03); }
          100% { transform: translateY(0px) scale(1); }
        }
        .animate-float2 {
          animation: float2 9s ease-in-out infinite;
        }
        .glass-card {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          border: 1.5px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(16px) saturate(180%);
        }
      `}</style>
    </div>
  );
} 