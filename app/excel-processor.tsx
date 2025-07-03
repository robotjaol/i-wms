import { useEffect } from 'react';
import { useSession } from '@/components/SessionContext';
import { useRouter } from 'next/navigation';
import ExcelProcessor from '@/components/ExcelProcessor';

export default function ExcelProcessorPage() {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace('/login');
    }
  }, [session, router]);

  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <ExcelProcessor />
    </div>
  );
} 