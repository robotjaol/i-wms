import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/SessionContext';

export default function Landing() {
  const router = useRouter();
  const { session } = useSession();
  const [show, setShow] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (session) {
      router.replace(session.role === 'supervisor' ? '/dashboard' : '/excel-processor');
      return;
    }
    document.body.style.overflow = 'hidden';
    timeoutRef.current = setTimeout(() => {
      setShow(false);
      router.push('/login');
    }, 4000);
    return () => {
      document.body.style.overflow = '';
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router, session]);

  const handleSkip = () => {
    setShow(false);
    router.push('/login');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a192f] to-[#1e293b] text-white w-full h-full">
      {/* Animated AGV/robot path (placeholder) */}
      <div className="mb-8 w-40 h-40 flex items-center justify-center">
        <div className="animate-bounce w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-orange-400 shadow-lg flex items-center justify-center">
          <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
            <rect x="8" y="20" width="32" height="12" rx="6" fill="#fff" opacity="0.2" />
            <rect x="16" y="16" width="16" height="16" rx="8" fill="#fff" />
            <circle cx="24" cy="32" r="4" fill="#f59e42" />
          </svg>
        </div>
      </div>
      {/* Fade-in Title */}
      <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fadeIn">
        i-WMS
      </h1>
      <p className="text-lg md:text-2xl font-medium mb-8 animate-fadeIn delay-200">
        Intelligent Warehouse Management System
      </p>
      {/* Loading Bar */}
      <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mb-8">
        <div className="h-full bg-gradient-to-r from-blue-400 to-orange-400 animate-loadingBar" />
      </div>
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-orange-400 text-white font-semibold shadow-md hover:scale-105 transition-transform"
      >
        Skip Intro
      </button>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
        }
        .animate-fadeIn.delay-200 {
          animation-delay: 0.2s;
        }
        @keyframes loadingBar {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-loadingBar {
          animation: loadingBar 3.5s linear forwards;
        }
      `}</style>
    </div>
  );
} 