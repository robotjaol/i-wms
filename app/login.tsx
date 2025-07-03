import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/SessionContext';

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

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.replace(session.role === 'supervisor' ? '/dashboard' : '/excel-processor');
    }
  }, [session, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = USERS.find(u => u.username === username && u.password === password);
    if (found) {
      login(found.username, found.role);
      setError('');
      router.replace(found.role === 'supervisor' ? '/dashboard' : '/excel-processor');
    } else {
      setError('Invalid username or password');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a192f] to-[#1e293b]">
      <form
        onSubmit={handleLogin}
        className={`w-full max-w-md bg-[#16213e] rounded-xl shadow-2xl p-8 flex flex-col gap-6 animate-fadeIn ${shake ? 'animate-shake' : ''}`}
        autoComplete="off"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-2">Login to i-WMS</h2>
        <div className="flex flex-col gap-2">
          <label className="text-white font-medium">Username</label>
          <input
            className={`px-4 py-2 rounded-lg bg-[#232f4b] text-white border-2 focus:outline-none focus:border-blue-400 transition-all ${error ? 'border-red-500' : 'border-transparent'}`}
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-white font-medium">Password</label>
          <input
            type="password"
            className={`px-4 py-2 rounded-lg bg-[#232f4b] text-white border-2 focus:outline-none focus:border-blue-400 transition-all ${error ? 'border-red-500' : 'border-transparent'}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" className="accent-blue-400" disabled />
          <label htmlFor="remember" className="text-gray-300 text-sm">Remember me</label>
        </div>
        {error && <div className="text-red-400 text-center font-medium">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-orange-400 text-white font-semibold shadow-md hover:scale-105 transition-transform"
        >
          Login
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
      `}</style>
    </div>
  );
} 