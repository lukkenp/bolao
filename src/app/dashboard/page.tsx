import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { LotteryResults } from '@/components/dashboard/LotteryResults';
import { UserPools } from '@/components/dashboard/UserPools';
import { getLotteryColor } from '@/lib/lottery';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Gerencie seus bolões e acompanhe os resultados.',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userName = session.user?.name?.split(' ')[0] || 'visitante';

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        subheading={`Bem-vindo(a), ${userName}! Visualize seus bolões ativos.`}
        className="border-b border-border pb-6 mb-6"
      />
      
      <div className="grid gap-6">
        {/* Estatísticas */}
        <DashboardStats />

        {/* Últimos Resultados */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Últimos Resultados
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <LotteryResults />
          </div>
        </div>

        {/* Seus Bolões */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Seus Bolões
            </h2>
            <a 
              href="/boloes/novo"
              className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                "h-9 px-4 py-2",
                getLotteryColor('megasena'),
                "hover:bg-emerald-500 text-white"
              )}
            >
              Criar Novo Bolão
            </a>
          </div>
          <UserPools />
        </div>
      </div>
    </DashboardShell>
  );
} 