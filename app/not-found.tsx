import { Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a192f] to-[#1e293b] text-white animate-fadeIn">
      <Truck className="w-16 h-16 mb-6 text-blue-400 animate-bounce" />
      <h1 className="text-4xl font-bold mb-2">404 Not Found</h1>
      <p className="mb-6 text-lg text-gray-300">The page you are looking for does not exist.</p>
      <button
        onClick={() => router.replace('/')}
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-orange-400 text-white font-semibold shadow-md hover:scale-105 transition-transform"
      >
        Go Home
      </button>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.4,0,0.2,1) forwards;
        }
      `}</style>
    </div>
  );
} 