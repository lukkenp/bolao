import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LotteryType } from '@/types';
import { getLotteryColor, getLotteryName } from '@/lib/lottery';
import { cn } from '@/lib/utils';
import { Eye, Users } from 'lucide-react';

interface Pool {
  id: string;
  name: string;
  lottery_type: LotteryType;
  draw_date: string;
  status: 'ativo' | 'encerrado' | 'cancelado';
  participants_count: number;
  tickets_count: number;
}

export function UserPools() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPools() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('pools')
          .select(`
            id,
            name,
            lottery_type,
            draw_date,
            status,
            participants:participants(count),
            tickets:tickets(count)
          `)
          .eq('admin_id', user.id)
          .order('draw_date', { ascending: true });

        if (error) throw error;

        const formattedPools = data.map(pool => ({
          ...pool,
          participants_count: pool.participants?.[0]?.count || 0,
          tickets_count: pool.tickets?.[0]?.count || 0
        }));

        setPools(formattedPools);
      } catch (error) {
        console.error('Erro ao buscar bolões:', error);
        toast({
          title: "Erro ao carregar bolões",
          description: "Não foi possível carregar seus bolões. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPools();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-4">
              <div className="h-5 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum bolão encontrado</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Você ainda não criou nenhum bolão. Que tal começar agora?
          </p>
          <Button
            asChild
            className={cn(
              "mt-4",
              getLotteryColor('megasena')
            )}
          >
            <a href="/boloes/novo">Criar Novo Bolão</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {pools.map((pool) => {
        const baseColorClass = getLotteryColor(pool.lottery_type);
        const textColorClass = baseColorClass.replace('bg-', 'text-').replace('-600', '-700');
        const borderColorClass = baseColorClass.replace('bg-', 'border-').replace('-600', '-500');

        return (
          <Card key={pool.id} className={cn("border", borderColorClass)}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className={cn("text-lg font-medium", textColorClass)}>
                  {pool.name}
                </CardTitle>
                <Badge
                  variant={pool.status === 'ativo' ? 'default' : 'secondary'}
                  className={cn(
                    pool.status === 'ativo' && baseColorClass
                  )}
                >
                  {pool.status === 'ativo' ? 'Ativo' : 'Encerrado'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {getLotteryName(pool.lottery_type)}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data do Sorteio</span>
                  <span className="font-medium">
                    {new Date(pool.draw_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Participantes</span>
                  <span className="font-medium">{pool.participants_count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bilhetes</span>
                  <span className="font-medium">{pool.tickets_count}</span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className={cn(
                    "w-full mt-2",
                    textColorClass,
                    borderColorClass
                  )}
                >
                  <a href={`/boloes/${pool.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 