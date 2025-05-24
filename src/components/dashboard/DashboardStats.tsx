import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getLotteryColor } from "@/lib/lottery";
import { cn } from "@/lib/utils";

interface StatsData {
  totalPools: number;
  totalParticipations: number;
  nextDrawDate: string | null;
}

export function DashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalPools: 0,
    totalParticipations: 0,
    nextDrawDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;

      try {
        // Busca total de bolões que o usuário criou
        const { data: pools, error: poolsError } = await supabase
          .from('pools')
          .select('id')
          .eq('admin_id', user.id);

        if (poolsError) throw poolsError;

        // Busca total de participações em bolões
        const { data: participations, error: participationsError } = await supabase
          .from('participants')
          .select('id')
          .eq('user_id', user.id);

        if (participationsError) throw participationsError;

        // Busca a data do próximo sorteio (bolão mais próximo)
        const { data: nextDraw, error: nextDrawError } = await supabase
          .from('pools')
          .select('draw_date')
          .eq('status', 'ativo')
          .gte('draw_date', new Date().toISOString())
          .order('draw_date', { ascending: true })
          .limit(1)
          .single();

        if (nextDrawError && nextDrawError.code !== 'PGRST116') {
          throw nextDrawError;
        }

        setStats({
          totalPools: pools?.length || 0,
          totalParticipations: participations?.length || 0,
          nextDrawDate: nextDraw?.draw_date || null,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user?.id]);

  const baseColorClass = getLotteryColor('megasena');
  const textColorClass = baseColorClass.replace('bg-', 'text-').replace('-600', '-700');

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Bolões
          </CardTitle>
          <Trophy className={cn("h-4 w-4", textColorClass)} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPools}</div>
          <p className="text-xs text-muted-foreground">
            Bolões que você participa
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Participações
          </CardTitle>
          <Users className={cn("h-4 w-4", textColorClass)} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalParticipations}</div>
          <p className="text-xs text-muted-foreground">
            Participantes nos seus bolões
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Próximo Sorteio
          </CardTitle>
          <Calendar className={cn("h-4 w-4", textColorClass)} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.nextDrawDate ? (
              new Date(stats.nextDrawDate).toLocaleDateString('pt-BR')
            ) : (
              "Nenhum sorteio"
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Data do próximo sorteio
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 