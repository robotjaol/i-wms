import { useEffect } from 'react';
import { useSession } from '@/components/SessionContext';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace('/login');
    } else if (session.role !== 'supervisor') {
      router.replace('/unauthorized');
    }
  }, [session, router]);

  if (!session || session.role !== 'supervisor') return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <Dashboard />
    </div>
  );
} 